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

### `list` / `ls`

List the URLs of all the entries in the HAR file. 

```bash
harcomb list my-file.har
```

This is more or less equivalent to this `jq` query:

```bash
 jq -r '.log.entries[].request.url' my-file.har
 ```

Options:

* `mimetype` — filter by the MIME type of the response.

### `extract`

Extract the content of the entries in the HAR file to the disk, in a file hierarchy that reproduces the URL structure. 

```bash
harcomb extract my-file.har
```

Options:

* `mimetype` — filter by the MIME type of the response.
* `outdir` — output directory, by default the CWD (current working directory).
* `force` — overwrite any existing files.

> You can use `harcomb list` as a dry-run to inspect the set of entries that would be written to disk.