import { Command } from 'commander'
import { createServer } from './server'
const program = new Command()

const mockAction = async (
  str: string,
  options: {
    port: string
  }
) => {
  if (options.port) {
    createServer().then(({ app }) =>
      app.listen(options.port || 6173, () => {
        console.log('http://localhost:6173')
      })
    )
  }
}

program
  .command('mock')
  .description('start a mock manage')
  .option('-p, --port', 'mock port')
  .action(mockAction)

program.parse(process.argv)
