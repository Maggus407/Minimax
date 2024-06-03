# essentials

## Project setup

```
1. npm install
2. npm run dev

```

## Run Minimax in the terminal

```
npm run minimax -- -h
npm run minimax <FILE.zip> -- <OPTIONS>

Example:
npm run minimax Programm.zip -- -if 0 -if 100 -i File1.txt -i File2.txt -e Solution.txt

Options:
  -V, --version                     output the version number
  -e, --exportFile <path>           Path to the file the machine memory should be exported to.       
  -ef, --exportFrom <address>       First address of the memory to be included in the dump. If unspecified, it defaults to address 0.
  -et, --exportTo <address>         Last memory address to be included in the dump. If unspecified, it defaults to 0xFFFFFF.
  -i, --importFile <items...>       File to be imported (default: [])
  -if, --importFrom <addresses...>  Start addresses for the imported files (default: [])
  -ib, --importBytes <bytes>        Number of bytes to import.
  -h, --help                        display help for command
```

See [Configuration Reference](https://vitejs.dev/config/).
