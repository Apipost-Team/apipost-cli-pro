<p align="center">
  <a href="https://adesign.apipost.cn/" target="_blank">
    <img alt="A-Design Logo" width="360" src="https://img.cdn.apipost.cn/cdn/opensource/apipost-opensource.svg" />
  </a>
</p>

`apipost-cli-pro` 是一个基于命令行的 Apipost 接口用例以及测试用例运行工具。它允许您轻松地直接从命令行运行和测试 Apipost 接口用例以及测试用例。它专注于可扩展性，因此您可以轻松地将其与持续集成服务器和构建系统集成。这使得您可以在不需要手动操作的情况下自动化测试和运行 Apipost 接口用例以及测试用例。

## 安装
使用以下命令安装Apipost CLI
``` javascript
npm install -g apipost-cli-pro
```

## 运行
```
apipost run https://workspace.apipost.net/open/ci/automated_testing?ci_id=MTkzMDI0MTEwMDU2ODQ5NDA4OjEyOTMzMDc1MDgzNjc3NzEwOjEzMDcyNjE0MDg3OTQ2Mjcy&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxODE0NCwiaXNzIjoiYXBpcG9zdCIsImV4cCI6MTcxNzY5MDAxNX0.wNNw0MbsbobhDcAZmiXJQu6lmhWaES6E2y8YFyKkzm8 -n 5 -r cli,json
```

![image.png](https://img.cdn.apipost.cn/upload/user/18144/log/8417e76a-4999-495f-8de9-57680b164765.png "image.png")

## 选项
```
Usage: apipost run [options] <url>

Options:
  -r, --reporters <reporters>           指定测试报告类型, 支持 cli,html,json  (default: "cli")
  -n, --iteration-count <n>             设置循环次数。默认值 1
  -d, --iteration-data <path>           设置用例循环的 [公共] 测试数据路径 (JSON 或 CSV)。如设置将替换默认 [公共] 测试数据。
  --external-program-path <path>        指定 [外部程序] 的所处文件路径，默认值为命令当前执行目录
  --out-dir <outDir>                    输出测试报告目录，默认目录为: /Users/mhw/apipost-reports
  --out-file <outFile>                  输出测试报告文件名，不需要添加后缀，默认格式为 apipost-reports-当前 YYYY-MM-DD HH:mm:ss
  --ignore-redirects <0/1>              阻止 Apipost 自动重定向返回 3XX 状态码的请求。0 阻止, 1 不阻止 (default: "0")
  --max-request-loop <n>                3XX重定向时的最大定向次数 (default: 5)
  --timeout-request <n>                 指定接口请求超时时间 (default: 0)
  --timeout-script <n>                  指定脚本预执行/后执行接口运行超时时间 (default: 5000)
  --delay-request <n>                   指定请求之间停顿间隔 (default: 0) (default: 0)
  -k --insecure <n>                     关闭 SSL 校验 (1 关闭, 0 开启。default: 1) (default: 1)
  --ssl-client-cert-list <path>         客户端证书配置文件(JSON)的路径。此选项优先于sslClientCert、sslClientKey和sslClientPassphrase。
  --ssl-client-cert <path>              指定客户端证书路径 (CRT file)
  --ssl-client-pfx <path>               指定客户端证书路径 (PFX file)
  --ssl-client-key <path>               指定客户端证书私钥路径 (KEY file)
  --ssl-client-passphrase <passphrase>  指定客户端证书密码 (for protected key)
  --ssl-extra-ca-certs <path>           指定额外受信任的 CA 证书 (PEM)
  --web-hook <url>                      Web-hook用于在任务完成后向指定URL发送JSON报告数据 (POST)
  -h, --help                            display help for command
```

## 升级版本
使用以下命令升级Apipost CLI工具
```
npm install apipost-cli-pro@latest -g
```