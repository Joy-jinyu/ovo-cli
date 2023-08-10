// import recast from 'recast'
// import { get } from 'lodash'

// export function decodeIntlGet(ast: recast.types.ASTNode, filePath: string): any[] {
//   const intlGetDataArr: any[] = []

//   recast.visit(ast, {
//     visitMemberExpression(path) {
//       const node = get(path, 'parentPath.node')
//       if (!isIntlGetNode(node)) return false

//       const { position, code } = getNodeCodeAndPosition(node, filePath)
//       const key = get(node, 'callee.object.arguments.0.value', '')
//       const d = get(node, 'arguments.0')
//       intlGetDataArr.push({ type: 'intlGet', d, key, code, position })
//       return false
//     }
//   })
//   return intlGetDataArr
// }
