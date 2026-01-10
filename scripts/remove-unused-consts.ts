import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

interface UnusedConst {
  file: string
  name: string
  line: number
  column: number
  statement: string
}

const BASE_DIR = path.join(__dirname, '..')
const SOURCE_DIRS = ['app', 'components', 'lib', 'types', 'i18n', 'data']
const EXCLUDE_PATTERNS = ['node_modules', '.next', 'out', 'scripts']

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList

  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      const shouldExclude = EXCLUDE_PATTERNS.some((pattern) =>
        filePath.includes(pattern)
      )
      if (!shouldExclude) {
        getAllTsFiles(filePath, fileList)
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (!filePath.includes('remove-unused-consts.ts')) {
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

function findConstDeclarations(
  sourceFile: ts.SourceFile
): Array<{ name: string; node: ts.VariableDeclaration; statement: ts.VariableStatement }> {
  const consts: Array<{
    name: string
    node: ts.VariableDeclaration
    statement: ts.VariableStatement
  }> = []

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (ts.isIdentifier(decl.name)) {
          consts.push({
            name: decl.name.text,
            node: decl,
            statement: node,
          })
        }
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return consts
}

function findReferencesInFile(
  sourceFile: ts.SourceFile,
  constName: string,
  excludeNode?: ts.Node
): number {
  let count = 0

  function visit(node: ts.Node) {
    if (node === excludeNode) {
      return
    }

    if (ts.isIdentifier(node) && node.text === constName) {
      const parent = node.parent
      if (
        !ts.isVariableDeclaration(parent) &&
        !ts.isBindingElement(parent) &&
        !ts.isPropertyAssignment(parent) &&
        !ts.isShorthandPropertyAssignment(parent) &&
        !ts.isImportSpecifier(parent) &&
        !ts.isExportSpecifier(parent)
      ) {
        count++
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return count
}

function checkConstUsage(
  constName: string,
  constFile: string,
  allFiles: string[]
): boolean {
  const program = ts.createProgram(allFiles, {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
  })

  let isUsed = false

  for (const file of allFiles) {
    const sourceFile = program.getSourceFile(file)
    if (!sourceFile) continue

    if (file === constFile) {
      const constSourceFile = program.getSourceFile(constFile)
      if (constSourceFile) {
        const consts = findConstDeclarations(constSourceFile)
        const targetConst = consts.find((c) => c.name === constName)
        if (targetConst) {
          const references = findReferencesInFile(
            constSourceFile,
            constName,
            targetConst.node
          )
          if (references > 0) {
            isUsed = true
            break
          }
        }
      }
    } else {
      const references = findReferencesInFile(sourceFile, constName)
      if (references > 0) {
        isUsed = true
        break
      }
    }
  }

  return isUsed
}

function removeUnusedConstFromFile(
  filePath: string,
  constName: string,
  statement: ts.VariableStatement
): boolean {
  const content = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.ES2020,
    true
  )

  const printer = ts.createPrinter({ removeComments: false })
  const statements: ts.Statement[] = []

  function visit(node: ts.Node) {
    if (ts.isSourceFile(node)) {
      node.statements.forEach((stmt) => {
        if (stmt === statement) {
          return
        }
        statements.push(stmt)
      })
    }
  }

  visit(sourceFile)

  const newContent = statements
    .map((stmt) => printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile))
    .join('\n')

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8')
    return true
  }

  return false
}

function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--delete')

  console.log('🔍 Scanning for unused constants...\n')
  if (dryRun) {
    console.log('📋 DRY RUN MODE - No files will be modified\n')
  }

  const allFiles: string[] = []
  SOURCE_DIRS.forEach((dir) => {
    const dirPath = path.join(BASE_DIR, dir)
    if (fs.existsSync(dirPath)) {
      getAllTsFiles(dirPath, allFiles)
    }
  })

  console.log(`Found ${allFiles.length} TypeScript files\n`)

  const unusedConsts: UnusedConst[] = []

  for (const filePath of allFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.ES2020,
        true
      )

      const consts = findConstDeclarations(sourceFile)

      for (const { name, node, statement } of consts) {
        const isUsed = checkConstUsage(name, filePath, allFiles)

        if (!isUsed) {
          const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart())
          const printer = ts.createPrinter()
          const statementText = printer.printNode(
            ts.EmitHint.Unspecified,
            statement,
            sourceFile
          )

          unusedConsts.push({
            file: path.relative(BASE_DIR, filePath),
            name,
            line: pos.line + 1,
            column: pos.character + 1,
            statement: statementText.split('\n')[0].trim(),
          })
        }
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error)
    }
  }

  if (unusedConsts.length === 0) {
    console.log('✅ No unused constants found!')
    return
  }

  console.log(`⚠️  Found ${unusedConsts.length} unused constants:\n`)
  unusedConsts.forEach(({ file, name, line, column, statement }) => {
    console.log(`  ${file}:${line}:${column}`)
    console.log(`    const ${name} = ...`)
    console.log(`    ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}\n`)
  })

  if (dryRun) {
    console.log('\n💡 To delete unused constants, run:')
    console.log('   npm run check-unused -- --delete\n')
    console.log('⚠️  Manual review is recommended before deletion.')
  } else {
    console.log('\n🗑️  Deleting unused constants...\n')

    let deletedCount = 0
    const filesToModify = new Map<string, Array<{ name: string; statement: ts.VariableStatement }>>()

    for (const { file, name } of unusedConsts) {
      const filePath = path.join(BASE_DIR, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.ES2020,
        true
      )

      const consts = findConstDeclarations(sourceFile)
      const targetConst = consts.find((c) => c.name === name)

      if (targetConst) {
        if (!filesToModify.has(filePath)) {
          filesToModify.set(filePath, [])
        }
        filesToModify.get(filePath)!.push({
          name,
          statement: targetConst.statement,
        })
      }
    }

    for (const [filePath, constsToRemove] of filesToModify) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.ES2020,
        true
      )

      const printer = ts.createPrinter({ removeComments: false })
      const statements: ts.Statement[] = []

      sourceFile.statements.forEach((stmt) => {
        const shouldRemove = constsToRemove.some(
          (c) => stmt === c.statement
        )
        if (!shouldRemove) {
          statements.push(stmt)
        } else {
          deletedCount++
          console.log(`  ✅ Removed: ${path.relative(BASE_DIR, filePath)} - ${constsToRemove.find(c => c.statement === stmt)?.name}`)
        }
      })

      const newContent = statements
        .map((stmt) => printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile))
        .join('\n')

      fs.writeFileSync(filePath, newContent, 'utf-8')
    }

    console.log(`\n✅ Deleted ${deletedCount} unused constants from ${filesToModify.size} files`)
  }
}

if (require.main === module) {
  main()
}
