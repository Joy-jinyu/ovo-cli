import { readdirSync, statSync } from 'fs'
import { join } from 'path'

// 深度遍历目录，找出所有文件
export function traverse(root: string) {
  let res: string[] = []
  try {
    const files = readdirSync(root)
    files.forEach((_file) => {
      const file = join(root, _file)
      const stats = statSync(file)
      if (stats.isDirectory()) {
        res = [...res, ...traverse(file)]
      } else if (stats.isFile()) {
        res.push(file)
      }
    })
  } catch (err) {
    console.log(err)
    process.exit()
  }
  return res
}
