<p align="center">
    <img alt="PageLoader" title="PageLoader" src="https://i.imgur.com/MfO9HIZ.png" width="150">
</p>

<div align="center">

### Hexlet tests and linter status:
[![Actions Status](https://github.com/aleksandrtamrazov/backend-project-lvl3/workflows/hexlet-check/badge.svg)](https://github.com/aleksandrtamrazov/backend-project-lvl3/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/020fabf81f971830e7f1/test_coverage)](https://codeclimate.com/github/aleksandrtamrazov/backend-project-lvl3/test_coverage)
[![linter-check](https://github.com/aleksandrtamrazov/backend-project-lvl3/actions/workflows/linter-check.yml/badge.svg)](https://github.com/aleksandrtamrazov/backend-project-lvl3/actions/workflows/linter-check.yml)

</div>

## About Page Loader
Page Loader is an open-source console tool for downloading page with its resources.

Features:
- You can choose output directory
- Debug support
- Downloads only local resources

## About this project

This project was created as part of the [Hexlet](https://ru.hexlet.io/) curriculum.

What I learned from this project:
- Promises
- Testing with Jest (mocking http requests and handle fs tests)
- Errors handling in async code

## Requirements
- [Node.js](https://nodejs.org/en/) version 16.x

## Getting started
- Clone the repository
```cmd
git clone git@github.com:aleksandrtamrazov/backend-project-lvl3.git
```
- Install dependencies
```cmd
cd backend-project-lvl3
make install
```
- Install project
```cmd
npm ci
```

## Usage
```cmd
Usage: page-loader [options] <url>

Page loader utility

Options:
  -V, --version       output the version number
  -o, --output [dir]  output dir (default: "/home/user/current-dir")
  -h, --help          display help for command
```

## Preview

### Downloading page
[![asciicast](https://asciinema.org/a/468513.svg)](https://asciinema.org/a/468513)

### Errors
[![asciicast](https://asciinema.org/a/468516.svg)](https://asciinema.org/a/468516)

### Debug
[![asciicast](https://asciinema.org/a/468528.svg)](https://asciinema.org/a/468528)