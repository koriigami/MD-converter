#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { convert } = require('../server/lib/converter');
const { templates } = require('../server/lib/templateRegistry');

program
  .name('md-convert')
  .description('Convert a Markdown file to DOCX or PDF with a styled preset')
  .version('1.0.0')
  .argument('<input>', 'Path to the .md file')
  .option('-t, --template <name>', 'Style preset to use', 'slate-pro')
  .option('-f, --format <type>',   'Output format: docx or pdf', 'docx')
  .option('-o, --out <path>',      'Output file path (defaults to same dir as input)')
  .option('-l, --list',            'List all available templates')
  .action(async (input, opts) => {
    if (opts.list) {
      listTemplates();
      process.exit(0);
    }

    const inputPath = path.resolve(input);
    if (!fs.existsSync(inputPath)) {
      console.error(`✗ File not found: ${inputPath}`);
      process.exit(1);
    }

    const format = opts.format.toLowerCase();
    if (!['docx', 'pdf'].includes(format)) {
      console.error('✗ --format must be "docx" or "pdf"');
      process.exit(1);
    }

    const templateId = opts.template;
    const validIds = templates.map((t) => t.id);
    if (!validIds.includes(templateId)) {
      console.error(`✗ Unknown template: "${templateId}"\n  Run with --list to see all options.`);
      process.exit(1);
    }

    const ext    = format;
    const base   = path.basename(inputPath, path.extname(inputPath));
    const outDir = opts.out
      ? path.dirname(path.resolve(opts.out))
      : path.dirname(inputPath);
    const outputPath = opts.out
      ? path.resolve(opts.out)
      : path.join(outDir, `${base}.${ext}`);

    console.log(`  template  ${templateId}`);
    console.log(`  format    ${format.toUpperCase()}`);
    console.log(`  output    ${outputPath}`);
    console.log();

    try {
      await convert({ inputPath, templateId, format, outputPath });
      console.log(`✓ Done → ${outputPath}`);
    } catch (err) {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    }
  });

// --list flag can also be passed before the input argument
program
  .command('list')
  .description('List all available style presets')
  .action(listTemplates);

function listTemplates() {
  const col1 = 20;
  console.log('\n  Available style presets:\n');
  console.log(`  ${'ID'.padEnd(col1)} ${'NAME'.padEnd(20)} FONT`);
  console.log(`  ${'-'.repeat(col1)} ${'-'.repeat(20)} ${'-'.repeat(30)}`);
  templates.forEach((t) => {
    console.log(`  ${t.id.padEnd(col1)} ${t.name.padEnd(20)} ${t.fonts}`);
  });
  console.log();
}

program.parse();
