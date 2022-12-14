import { Command } from 'commander'
import chalk from 'chalk'
const program = new Command()
const log = console.log

program.name('ovo-cli').description('ovo cli tools').version('0.0.4')

program
  .command('hello')
  .description('hello commander')
  .argument('<string>', 'console name')
  .option('-n, --name', 'show you name')
  .option('-s, --separator <char>', 'separator character', ',')
  .action(async (str, options) => {
    if (options.name) {
      log(`hello ${chalk.bold.red(str)}, it's happy to meet you!`)
    }
  })

program.parse(process.argv)
