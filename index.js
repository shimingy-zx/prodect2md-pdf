/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2024-03-23 18:23:47
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2024-05-09 01:45:52
 * @FilePath: /demo_project/index.js
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
const fs = require("fs");
const path = require("path");
const markdownpdf = require("markdown-pdf");

const projectRoot = "/Users/yangshiming/code/node/express/project2md";

// 定义要忽略的文件和文件夹
const ignoredFiles = [".DS_Store", "package-lock.json"];
const ignoredFolders = [
  "node_modules",
  ".git",
  ".DS_Store",
  "logs",
  "run",
  "examples",
  "test",
];
const ignoredExtensions = [".log", ".tmp", ".png", ".svg"];

const markdownFilePath = "project-content.md";
const pdfFilePath = "project-content.pdf";

function traverseDirectory(directory, markdownContent) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const fullPath = path.join(directory, file);
    const relativePath = path.relative(projectRoot, fullPath);
    const fileExtension = path.extname(file); // 获取文件的扩展名

    console.log(relativePath);

    // 检查当前文件或文件夹是否在忽略列表中
    if (
      ignoredFiles.includes(file) ||
      ignoredFolders.includes(file) ||
      ignoredExtensions.includes(fileExtension)
    ) {
      if (fs.statSync(fullPath).isDirectory()) {
        markdownContent += `\n_This directory is ignored_\n`;
      } else {
        markdownContent += `\n_This file is ignored_\n`;
      }
      return; // 跳过当前文件或文件夹
    }

    if (fs.statSync(fullPath).isDirectory()) {
      markdownContent += `\n### ${relativePath}\n`;
      markdownContent = traverseDirectory(fullPath, markdownContent);
    } else {
      const ext = path.extname(relativePath).slice(1);
      markdownContent += `\n\`\`\`${ext}\n${relativePath}\n\`\`\`\n`;
      markdownContent += fs.readFileSync(fullPath, "utf8");
    }
  });

  return markdownContent;
}

let markdownContent = "";

try {
  markdownContent = traverseDirectory(projectRoot, markdownContent);

  fs.writeFileSync(markdownFilePath, markdownContent, { flag: "w" });
  console.log("Markdown file generated successfully!");

  markdownpdf()
    .from.string(markdownContent)
    .to(pdfFilePath, () => {
      console.log("PDF file generated successfully!");
    });
} catch (error) {
  console.error("An error occurred:", error);
}
