# SSH 密钥免密登录

本文介绍如何在本地客户端（macOS / Linux）与远程 Linux 服务器之间配置基于 SSH 密钥的免密登录。

---

## 创建 SSH 密钥对

SSH 密钥对由**私钥**和**公钥**组成，私钥保存在本地，公钥分发到远程服务器。

**检查已有密钥**

在创建新密钥之前，先检查 `~/.ssh` 目录下是否已有密钥文件，避免意外覆盖。

```bash
ls -la ~/.ssh
```

常见的默认密钥文件为 `id_rsa`、`id_ed25519` 及其对应的 `.pub` 公钥文件。

**生成自定义名称的密钥**

使用 `ssh-keygen` 命令生成密钥，通过 `-f` 参数指定自定义文件名，**不会覆盖**已有的默认密钥。

**ed25519 算法（推荐）**

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/my_server_key
```

- `-t ed25519`：指定密钥算法，`ed25519` 安全性高且密钥长度短，推荐优先使用

**RSA 算法（兼容性更好）**

部分旧版服务器或特定设备可能不支持 `ed25519`，此时可使用 RSA 算法：

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/my_server_rsa_key
```

- `-t rsa`：指定 RSA 算法
- `-b 4096`：指定密钥长度为 4096 位，安全性更高

**通用参数说明**

- `-C`：注释内容，通常填写邮箱或用途描述
- `-f`：指定密钥文件的保存路径和名称

执行后会生成两个文件：

- 私钥文件（如 `~/.ssh/my_server_key`）：**务必妥善保管，不可泄露**
- 公钥文件（如 `~/.ssh/my_server_key.pub`）：需要上传到远程服务器

如果密钥文件已存在，`ssh-keygen` 会提示是否覆盖，输入 `n` 即可保留原文件并退出。

---

## Linux 服务器配置

将本地生成的公钥添加到远程 Linux 服务器的授权列表中，即可实现免密登录。

**方式一：使用 ssh-copy-id（推荐）**

`ssh-copy-id` 会自动将公钥追加到服务器的 `~/.ssh/authorized_keys` 文件中。

```bash
ssh-copy-id -i ~/.ssh/my_server_key.pub user@server_ip
```

参数说明：

- `-i`：指定要上传的公钥文件
- `user`：远程服务器的用户名
- `server_ip`：远程服务器的 IP 地址或域名
- `-p`: 服务器 ssh 端口

首次执行时需要输入远程用户的密码，上传成功后即可免密登录。

**方式二：手动配置**

若服务器未安装 `ssh-copy-id`，可手动完成配置。

在本地执行，将公钥内容复制到剪贴板：

```bash
cat ~/.ssh/my_server_key.pub
```

登录到远程服务器，创建并编辑授权文件：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "粘贴公钥内容到这里" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**关键权限说明**：

- `~/.ssh` 目录权限必须为 `700`（`rwx------`）
- `~/.ssh/authorized_keys` 文件权限必须为 `600`（`rw-------`）
- 权限过于宽松会导致 SSH 拒绝读取，免密登录失效

**确保 SSH 服务开启密钥认证**

编辑远程服务器的 SSH 配置文件：

```bash
sudo vim /etc/ssh/sshd_config
```

确认以下配置项：

```
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

如果修改了配置，需要重启 SSH 服务使更改生效：

```bash
# 基于 systemd 的系统
sudo systemctl restart sshd

# 部分系统使用 ssh 服务名
sudo systemctl restart ssh
```

---

## macOS 本地配置

macOS 系统自带 OpenSSH 客户端，无需额外安装软件。

**管理多个密钥**

当本地存在多组密钥时，建议使用 **SSH 配置文件** 为不同主机指定对应的私钥，避免手动输入 `-i` 参数。

编辑或创建 `~/.ssh/config`：

```bash
vim ~/.ssh/config
```

添加主机配置：

```
Host myserver
    HostName server_ip
    User user
    IdentityFile ~/.ssh/my_server_key
    IdentitiesOnly yes
```

配置项说明：

- `Host`：自定义别名，后续可通过 `ssh myserver` 快速连接
- `HostName`：远程服务器的实际 IP 或域名
- `User`：登录用户名
- `IdentityFile`：指定该主机使用的私钥路径
- `IdentitiesOnly yes`：**只使用指定的密钥**，防止 SSH 客户端尝试发送其他密钥导致认证失败

**密钥权限**

macOS 同样要求私钥文件权限正确：

```bash
chmod 600 ~/.ssh/my_server_key
```

---

## 使用 SSH 免密登录

配置完成后，即可通过 SSH 命令免密登录远程服务器。

**直接使用 IP 和私钥**

```bash
ssh -i ~/.ssh/my_server_key user@server_ip
```

**使用 config 别名（推荐）**

如果在 `~/.ssh/config` 中配置了别名：

```bash
ssh myserver
```

**验证免密是否生效**

执行上述命令后，如果**未提示输入密码**且直接登录到远程服务器 shell，说明免密配置成功。

**首次连接时的指纹确认**

如果之前未连接过该服务器，SSH 会提示确认主机指纹：

```
The authenticity of host 'server_ip (server_ip)' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

输入 `yes` 即可将服务器指纹记录到 `~/.ssh/known_hosts` 中，后续不再提示。

---

## 常见问题排查

**仍提示输入密码**

- 检查远程服务器 `~/.ssh/authorized_keys` 中是否包含正确的公钥内容
- 确认远程服务器 `~/.ssh` 权限为 `700`，`authorized_keys` 权限为 `600`
- 检查远程服务器的 `/var/log/secure` 或 `/var/log/auth.log` 查看详细拒绝原因
- 确认本地私钥文件权限为 `600`

**权限警告**

若看到 `WARNING: UNPROTECTED PRIVATE KEY FILE!`，说明私钥文件权限过于宽松，执行：

```bash
chmod 600 ~/.ssh/my_server_key
```

**Too many authentication failures**

当本地密钥较多时，SSH 客户端可能尝试发送错误的密钥导致服务器拒绝。在 `~/.ssh/config` 中为对应主机添加 `IdentitiesOnly yes` 即可解决。
