import { Command } from 'commander'
import chalk from 'chalk'
const program = new Command()
const log = console.log

const helloAction = async (
  str: string,
  options: {
    name: string
  }
) => {
  if (options.name) {
    log(`hello ${chalk.bold.red(str)}, it's happy to meet you!`)
  }
}

program
  .command('hello')
  .description('hello commander')
  .argument('<string>', 'console name')
  .option('-n, --name', 'show you name')
  .option('-s, --separator <char>', 'separator character', ',')
  .action(helloAction)

program.parse(process.argv)
