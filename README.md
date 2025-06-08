# harcomb

A command-line tool to comb through HAR (HTTP Archive) files.

## Usage

Harcomb can be installed globally from the npm registry:

```bash
npm install -g harcomb
```

It can also be used without installation with `npx`:

```bash
npx harcomb list my-file.har
```

## Available commands 

### `harcomb list`

* `mimetype` — filter by the MIME type of the response.

### `harcomb extract`

* `mimetype` — filter by the MIME type of the response.
* `outdir` — output directory.
* `force` — overwrite any existing files.

