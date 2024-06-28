import { Command } from 'commander'
import { createServer } from './server'
import chalk from 'chalk'

export const registerMock = (program: Command) => {
  const mockAction = async (apiTarget: string, staticTarget: string) => {
    const opts = program.opts()
    const port = opts.port || 6173
    createServer({
      apiTarget,
      staticTarget
    }).then(({ app }) =>
      app.listen(port, () => {
        console.log(
          chalk.green.underline(`http://localhost:${port}`)
        )
      })
    )
  }

  program.option('-p, --port <port>', 'mock port');

  program
    .command('mock')
    .description('start a mock manage')
    .arguments("[apiTarget] [staticTarget]")
    .action(mockAction)
}
