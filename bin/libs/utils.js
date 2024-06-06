const Table = require('cli-table3'),
    APTools = require('apipost-inside-tools'),
    fs = require('fs'),
    path = require('path'),
    template = require('art-template'),
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)),
    dayjs = require('dayjs'),
    _ = require('lodash');

function reportersCLI(data) {
    const outputMetrics = {
        "metrics": [
            {
                "name": "Number of API requests",
                "value": _.get(data, 'data.total_request_count', 0)
            },
            {
                "name": "Number of assertions",
                "value": _.get(data, 'data.assert.total', 0)
            },
            {
                "name": "Failed API requests",
                "value": _.get(data, 'data.http.error', 0)
            },
            {
                "name": "Failed assertions",
                "value": _.get(data, 'data.assert.error', 0)
            },
            {
                "name": "Start time",
                "value": new Date(_.get(data, 'data.start_at', 0)).toUTCString()
            },
            {
                "name": "End time",
                "value": new Date(_.get(data, 'data.end_at', 0)).toUTCString()
            },
            {
                "name": "Total duration",
                "value": `${_.get(data, 'data.total_time', 0)} ms`
            },
            {
                "name": "Total response time",
                "value": `${_.get(data, 'data.total_response_time', 0)} ms`
            },
            {
                "name": "Average response time",
                "value": `${_.get(data, 'data.avg_response_time', 0)} ms`
            },
            {
                "name": "Total response data size",
                "value": `${_.get(data, 'data.total_response_size', 0)} kb`
            },
            {
                "name": "Number of iterations",
                "value": `${_.get(data, 'data.iteration_count', 0)} times`
            }
        ]
    };

    // 创建表格
    const overviewTable = new Table({
        head: ['Metric', 'Value']
    });

    // 添加数据到表格
    outputMetrics.metrics.forEach(metric => {
        overviewTable.push([metric.name, metric.value]);
    });
    overviewTable.push([{ content: 'Generated by apipost-cli-pro ( https://github.com/Apipost-Team/apipost-cli-pro )', colSpan: 2, hAlign: 'center' }])

    // 打印表格
    console.log(overviewTable.toString(), "\n");

    // 将错误的URL打印出来
    const listTable = new Table({
        head: ['#', 'Failure URL', 'Failure detail'],
        chars: {
            'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
            'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
            'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
            'right': '', 'right-mid': '', 'middle': ' '
        },
        style: { 'head': [], 'border': [] }
    });

    // 添加头部和数据
    _.forEach(_.get(data, 'data.list'), (item, key) => {
        if (item.status.http !== 'OK') {
            listTable.push(
                [key + 1, `${item?.name}(${item?.url})`, item.status.http]
            );
        }
        if (item.status.assert !== 'OK') {
            const assertError = [];
            _.forEach(item.status.assert, (err) => {
                assertError.push(`${err?.error?.name}: ${err?.error?.message}`)
            })

            listTable.push(
                [key + 1, `${item?.name}(${item?.url})`, _.join(assertError, "\n")]
            );
        }
    });

    // 打印表格
    console.log(listTable.toString());
}

function reportersJSON(data, option) {
    try {
        if (!fs.existsSync(option?.outDir)) {
            fs.mkdirSync(option?.outDir, { recursive: true }); // 递归创建目录
        }

        const fileName = option?.outFile != '' ? option?.outFile : `apipost-reports-${dayjs().format('YYYY-MM-DD_HHmmss')}`;
        const filePath = path.join(option?.outDir, `${fileName}.json`);

        try {
            fs.writeFileSync(filePath, JSON.stringify(data));
            console.log(`\nJSON report has been written to file ${filePath} successfully! `);
        } catch (e) {
            console.error("The test report failed to write to the file: ", String(e));
        }
    } catch (e) {
        console.error("Report directory creation failed. Please try using sudo permission: ", String(e))
    }
}

async function reportersHOOK(data, option) {
    try {
        const response = await fetch(option?.webHook, {
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error(`POST request failed with status ${response.status}`);
        } else {
            console.log(`\nThe JSON-formatted test report has been sent via POST to ${option?.webHook}.`)
        }
    } catch (error) {
        console.error(`Error during POST request(${option?.webHook}): ${error.message}`);
    }
}

function reportersHTML(data, option) {
    try {
        // 接口通过率
        const httpPassPer = `${100 * _.floor(_.get(data, 'data.http.success') / _.get(data, 'data.http.total'), 4)}%`;
        const httpUnPassPer = `${100 * _.floor(_.get(data, 'data.http.error') / _.get(data, 'data.http.total'), 4)}%`;

        _.assign(_.get(data, 'data.http'), {
            httpPassPer, httpUnPassPer
        })

        // 断言通过率
        const assertPassPer = `${100 * _.floor(_.get(data, 'data.assert.success') / _.get(data, 'data.assert.total'), 4)}%`;
        const assertUnPassPer = `${100 * _.floor(_.get(data, 'data.assert.error') / _.get(data, 'data.assert.total'), 4)}%`;

        _.assign(_.get(data, 'data.assert'), {
            assertPassPer, assertUnPassPer
        })

        // 开始时间和结束时间
        const startAt = new Date(_.get(data, 'data.start_at', 0)).toUTCString();
        const endAt = new Date(_.get(data, 'data.end_at', 0)).toUTCString();
        _.assign(_.get(data, 'data'), {
            startAt, endAt
        })

        var html = template(__dirname + '/tpl-report.html', data);

        try {
            if (!fs.existsSync(option?.outDir)) {
                fs.mkdirSync(option?.outDir, { recursive: true }); // 递归创建目录
            }

            const fileName = option?.outFile != '' ? option?.outFile : `apipost-reports-${dayjs().format('YYYY-MM-DD_HHmmss')}`;
            const filePath = path.join(option?.outDir, `${fileName}.html`);

            try {
                fs.writeFileSync(filePath, html);
                console.log(`\nHTML report has been written to file ${filePath} successfully! `);
            } catch (e) {
                console.error("The test report failed to write to the file: ", String(e));
            }
        } catch (e) {
            console.error("Report directory creation failed. Please try using sudo permission: ", String(e))
        }
    } catch (e) {
        console.error(`Error during create html request: ${String(e)}`);
    }
}


async function setUserOption(options, option, defaults) {
    _.defaults(options, defaults);

    // 执行次数
    const iterationCount = _.toInteger(_.get(options, 'iterationCount'));
    if (iterationCount >= 1) {
        _.assign(option, { iterationCount })
    }

    // 执行间隔
    const sleep = _.toInteger(_.get(options, 'delayRequest'));
    if (sleep >= 0) {
        _.assign(option, { sleep })
    }

    // 测试数据
    const iterationDataFile = String(_.get(options, 'iterationData'));
    try {
        const iterationData = await APTools.str2testDataAsync(fs.readFileSync(String(iterationDataFile), "utf-8"));

        if (_.isArray(interData)) {
            _.assign(option, { iterationData })
        }
    } catch (e) { }

    // 外部程序路径
    const externalPrograms = _.trim(String(_.get(options, 'externalProgramPath')));
    if (externalPrograms != '') {
        _.assign(process, { externalPrograms })
    }

    // 忽略3XX 状态码的请求重定向
    _.set(option, 'system_configs.auto_redirect', _.toInteger(_.get(options, 'ignoreRedirects')) > 0 ? -1 : 1)

    // 3XX重定向时的最大定向次数
    const maxRequestLoop = _.toInteger(_.get(options, 'maxRequestLoop'));
    if (maxRequestLoop > 0) {
        _.set(option, 'system_configs.max_redirect_time', maxRequestLoop)
    }

    // 指定接口请求超时时间
    const timeoutRequest = _.toInteger(_.get(options, 'timeoutRequest'));
    if (timeoutRequest >= 0) {
        _.set(option, 'system_configs.send_timeout', timeoutRequest)
    }

    // 指定脚本请求超时时间
    const timeoutScript = _.toInteger(_.get(options, 'timeoutScript'));
    if (timeoutScript >= 0) {
        _.set(option, 'system_configs.script_timeout', timeoutScript)
    }

    // CA 证书
    const sslExtraCaCerts = _.trim(String(_.get(options, 'sslExtraCaCerts')));
    if (sslExtraCaCerts != '') {
        try {
            fs.statSync(sslExtraCaCerts);
            _.set(option, `system_configs.ca_cert`, {
                open: 1,
                path: sslExtraCaCerts
            });
        } catch (e) { }
    }

    // 客户端证书
    const sslClientCertListFile = _.trim(String(_.get(options, 'sslClientCertList')));
    if (sslClientCertListFile != '') {
        try {
            const sslClientCertList = fs.readFileSync(sslClientCertListFile, "utf-8");
            if (_.isObject(sslClientCertList)) {
                _.set(option, 'system_configs.client_cert', sslClientCertList)
            }
        } catch (e) { }
    } else {
        const clientCert = {
            "https://*:443": {
                "pfx": {
                    "file_url": ""
                },
                "crt": {
                    "file_url": ""
                },
                "key": {
                    "file_url": ""
                },
                "password": "",
                "HOST": "https://*:443"
            }
        };
        const sslClientCert = _.trim(String(_.get(options, 'sslClientCert')));
        if (sslClientCert != '') {
            try {
                fs.statSync(sslClientCert);
                _.set(clientCert, `https://*:443.crt.file_url`, sslClientCert);
            } catch (e) { }
        }

        const sslClientKey = _.trim(String(_.get(options, 'sslClientKey')));
        if (sslClientKey != '') {
            try {
                fs.statSync(sslClientKey);
                _.set(clientCert, `https://*:443.key.file_url`, sslClientKey);
            } catch (e) { }
        }

        const sslClientPfx = _.trim(String(_.get(options, 'sslClientPfx')));
        if (sslClientPfx != '') {
            try {
                fs.statSync(sslClientPfx);
                _.set(clientCert, `https://*:443.pfx.file_url`, sslClientPfx);
            } catch (e) { }
        }

        const passphrase = _.trim(String(_.get(options, 'passphrase')));
        if (passphrase != '') {
            _.set(clientCert, `https://*:443.password`, sslClientPfx);
        }

        _.set(option, 'system_configs.client_cert', _.assign(_.get(option, 'system_configs.client_cert'), clientCert))
    }

}
module.exports = {
    reportersCLI,
    setUserOption,
    reportersJSON,
    reportersHOOK,
    reportersHTML
};