## 异常处理

客户端错误

```
  import { ApiException } from 'shared/exception';

  throw ApiException.tipError('I18nPath', { key: value})
```

服务端错误

```
  import { ServerException, CommonException } from 'shared/exception';

  throw new ServerException(CommonException.SERVER_ERROR)
```

## MINIO

控制台： <http://8.138.12.102:9001/>

## compodoc

<https://compodoc.app/guides/options.html>
查看模块信息

## migration 迁移

生产环境下数据库synchronize配置为false，需要手动执行命令迁移数据库变动

推送代码前执行以下命令

```sh
  pnpm run migration:generate 迁移名称
```

在生产环境下执行以下命令，应用迁移

```sh
  pnpm run migration:run
```
