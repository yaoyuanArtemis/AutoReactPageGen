import inquirer from "inquirer";
import fs from "fs";
/* 
    {
    name: "stores",
    slider: "none",
    content: {
      use: "tableContent",
      rollAble: true,
      pageAble: true,
    },
    data: {},
  },
*/

function createBatchConfigFile(res) {
  // 文件读取模块
  if (res instanceof Array) {
    res.forEach((item) => {
      templatePlace(item);
    });
  } else {
    console.log(666, res);
    templatePlace(res);
  }

  function templatePlace(obj) {
    let _template = fs.readFileSync("./template.jsx").toString();
    let _content = "<contentReplace />{{page}}";
    _template = _template.replace(
      "<sliderReplace />",
      obj.slider !== "none" ? `<${obj.slider}/>` : ""
    );
    if (obj.content.rollAble) {
      _content = `<scroll>${_content}</scroll>`;
    }
    if (obj.content.pageAble) {
      (obj.data.pageSize = 10), (obj.data.pageCurrent = 0);
    }
    _content = _content.replace(
      "{{page}}",
      obj.content.pageAble ? `<page pageSize={${obj.data.pageSize}}/>` : ""
    );
    _content = _content.replace(
      "<contentReplace />",
      obj.content.use === "sourceContent"
        ? `<sourceContent/>`
        : `<tableContent/>`
    );

    _template = _template.replace("<contentReplace />", _content);
    fs.writeFileSync(`./${obj.name}.jsx`, _template, function () {});
  }
}

// 交互模块
inquirer
  .prompt([
    {
      type: "list",
      name: "renderType",
      message: "选择生成方式?",
      choices: ["批量生成", "单个生成"],
    },
  ])
  .then((answers) => {
    if (answers.renderType === "批量生成") {
      import("./render.config.js").then((res) => {
        createBatchConfigFile(res.default);
      });
    } else {
      inquirer
        .prompt([
          {
            type: "input",
            name: "name",
            message: "请输入文件名",
          },
          {
            type: "list",
            name: "slider",
            message: "选择sliderType",
            choices: ["none", "list", "treeList"],
          },
          {
            type: "list",
            name: "content",
            message: "选择contentType",
            choices: ["sourceContent", "tableContent"],
          },
          {
            type: "confirm",
            name: "rollAble",
            message: "是否需要滚动",
          },
          {
            type: "confirm",
            name: "pageAble",
            message: "是否需要页码",
          },
        ])
        .then((res) => {
          console.log(222, res);
          let _o = {};
          _o.name = res.name;
          _o.slider = res.slider;
          _o.data = {};
          _o.content = {
            use: res.content,
            rollAble: res.rollAble,
            pageAble: res.pageAble,
          };
          createBatchConfigFile(_o);
        });
    }
  });
