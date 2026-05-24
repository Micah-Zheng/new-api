package common

import (
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"net/smtp"
	"slices"
	"strings"
	"time"
)

// ── shadcn/ui-style email shell ───────────────────────────────────────────────
// Colors are derived from web/default/src/styles/theme.css (OKLCH → hex).
//
//	--background      #ffffff   --foreground       #0a0a0a
//	--card            #ffffff   --card-foreground  #0a0a0a
//	--primary         #070707   --primary-fg       #fafafa
//	--muted           #f5f5f5   --muted-foreground #606060
//	--border          #e8e8e8
//	--destructive     #e7000b   --destructive-fg   #fafafa
//	--warning         #d08700   --warning-fg       #0a0a0a
//	--success         #009966   --success-fg       #fafafa
const (
	emailColorBg         = "#ffffff"
	emailColorFg         = "#0a0a0a"
	emailColorMuted      = "#f5f5f5"
	emailColorMutedFg    = "#606060"
	emailColorBorder     = "#e8e8e8"
	emailColorPrimary    = "#070707"
	emailColorPrimaryFg  = "#fafafa"
	emailColorDestr      = "#e7000b"
	emailColorDestrFg    = "#fafafa"
	emailColorWarning    = "#d08700"
	emailColorWarningFg  = "#0a0a0a"
	emailColorSuccess    = "#009966"
	emailColorSuccessFg  = "#fafafa"
	emailLogoURL         = "https://api.tcp.red/logo-custom.png"
	emailFontStack       = `-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif`
)

// BuildEmailHTML wraps bodyHTML in the shared shadcn/ui-style card shell.
// systemName is used in the header label and footer.
// showLogo controls whether the logo image is rendered above the header label.
func BuildEmailHTML(systemName, bodyHTML string, showLogo bool) string {
	logoBlock := ""
	if showLogo {
		logoBlock = fmt.Sprintf(`
        <!-- Logo -->
        <tr>
          <td style="padding:24px 28px 0 28px;">
            <img src="%s" alt="%s" width="36" height="36"
                 style="display:block;border-radius:6px;border:0;" />
          </td>
        </tr>`, emailLogoURL, systemName)
	}

	darkModeStyle := `
  <style>
    @media (prefers-color-scheme: dark) {
      body, .email-outer { background-color: #1c1c1c !important; }
      .email-card        { background-color: #2a2a2a !important; border-color: #3a3a3a !important; }
      .email-header-label{ color: #a0a0a0 !important; }
      .email-body-text   { color: #e0e0e0 !important; }
      .email-muted-text  { color: #a0a0a0 !important; }
      .email-muted-block { background-color: #333333 !important; }
      .email-separator   { background-color: #3a3a3a !important; }
      .email-detail-row-alt { background-color: #333333 !important; }
      .email-detail-border  { border-color: #3a3a3a !important; }
      .email-fg-text     { color: #e8e8e8 !important; }
    }
  </style>`

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s</title>
%s
</head>
<body class="email-outer" style="margin:0;padding:0;background:%s;font-family:%s;">
  <table width="100%%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:%s;padding:40px 16px;">
    <tr><td align="center">

      <!-- Card -->
      <table class="email-card" width="100%%" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:520px;background:%s;border:1px solid %s;border-radius:8px;overflow:hidden;">
        %s
        <!-- Header label -->
        <tr>
          <td style="padding:20px 28px 0 28px;">
            <p class="email-header-label" style="margin:0;font-size:12px;font-weight:600;
               color:%s;letter-spacing:0.06em;text-transform:uppercase;">%s</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:20px 28px 28px 28px;">
            %s
          </td>
        </tr>

        <!-- Separator -->
        <tr>
          <td style="padding:0 28px;">
            <div class="email-separator" style="height:1px;background:%s;"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:14px 28px 20px 28px;">
            <p class="email-muted-text" style="margin:0;font-size:12px;color:%s;line-height:1.6;">
              这是一封由 %s 系统自动发送的邮件，请勿直接回复。<br>
              我们永远不会主动向您索要验证码、密码或任何账户凭据。
            </p>
          </td>
        </tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`,
		systemName,
		darkModeStyle,
		emailColorMuted,
		emailFontStack,
		emailColorMuted,
		emailColorBg,
		emailColorBorder,
		logoBlock,
		emailColorMutedFg,
		systemName,
		bodyHTML,
		emailColorBorder,
		emailColorMutedFg,
		systemName,
	)
}

// emailBtn returns an inline HTML button styled to shadcn/ui Button spec.
func emailBtn(label, href, bg, color string) string {
	return fmt.Sprintf(
		`<a href="%s" style="display:inline-block;background:%s;color:%s;`+
			`text-decoration:none;font-size:14px;font-weight:500;`+
			`padding:9px 20px;border-radius:6px;line-height:1;">%s</a>`,
		href, bg, color, label,
	)
}

// BuildVerificationEmailContent returns the HTML body for email-verification emails.
func BuildVerificationEmailContent(systemName, code string, validMinutes int) string {
	body := fmt.Sprintf(`
<h2 class="email-fg-text" style="margin:0 0 6px 0;font-size:20px;font-weight:600;color:%s;">邮箱验证</h2>
<p class="email-muted-text" style="margin:0 0 20px 0;font-size:14px;color:%s;line-height:1.6;">
  你正在进行 <strong style="color:%s;">%s</strong> 邮箱验证，请使用以下验证码完成操作。
</p>

<table class="email-muted-block" width="100%%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:%s;border-radius:6px;margin-bottom:20px;">
  <tr>
    <td style="padding:20px;text-align:center;">
      <span class="email-fg-text" style="font-size:36px;font-weight:700;letter-spacing:12px;
            color:%s;font-variant-numeric:tabular-nums;">%s</span>
    </td>
  </tr>
</table>

<p class="email-muted-text" style="margin:0;font-size:13px;color:%s;line-height:1.6;">
  验证码 <strong>%d 分钟</strong>内有效。如果不是本人操作，请忽略此邮件。<br>
  我们永远不会主动向您索要此验证码。
</p>`,
		emailColorFg,
		emailColorMutedFg, emailColorFg, systemName,
		emailColorMuted,
		emailColorFg, code,
		emailColorMutedFg, validMinutes,
	)
	return BuildEmailHTML(systemName, body, true)
}

// BuildPasswordResetEmailContent returns the HTML body for password-reset emails.
func BuildPasswordResetEmailContent(systemName, resetLink string, validMinutes int) string {
	btn := emailBtn("重置密码", resetLink, emailColorPrimary, emailColorPrimaryFg)
	body := fmt.Sprintf(`
<h2 class="email-fg-text" style="margin:0 0 6px 0;font-size:20px;font-weight:600;color:%s;">密码重置</h2>
<p class="email-muted-text" style="margin:0 0 20px 0;font-size:14px;color:%s;line-height:1.6;">
  你正在进行 <strong style="color:%s;">%s</strong> 密码重置，点击下方按钮继续。
</p>

<p style="margin:0 0 20px 0;">%s</p>

<table class="email-muted-block" width="100%%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:%s;border-radius:6px;margin-bottom:20px;">
  <tr>
    <td style="padding:12px 16px;">
      <p class="email-muted-text" style="margin:0 0 4px 0;font-size:12px;color:%s;">
        按钮无法点击？复制以下链接到浏览器：
      </p>
      <p class="email-fg-text" style="margin:0;font-size:12px;color:%s;word-break:break-all;">%s</p>
    </td>
  </tr>
</table>

<p class="email-muted-text" style="margin:0;font-size:13px;color:%s;line-height:1.6;">
  重置链接 <strong>%d 分钟</strong>内有效。如果不是本人操作，请忽略此邮件。
</p>`,
		emailColorFg,
		emailColorMutedFg, emailColorFg, systemName,
		btn,
		emailColorMuted,
		emailColorMutedFg,
		emailColorFg, resetLink,
		emailColorMutedFg, validMinutes,
	)
	return BuildEmailHTML(systemName, body, true)
}

// BuildQuotaWarningEmailContent returns the HTML body for quota-warning emails.
func BuildQuotaWarningEmailContent(systemName, prompt, quotaStr, topUpLink string) string {
	btn := emailBtn("立即充值", topUpLink, emailColorWarning, emailColorWarningFg)
	body := fmt.Sprintf(`
<p style="margin:0 0 16px 0;">
  <span style="display:inline-block;background:#fff8e6;color:%s;
        font-size:12px;font-weight:500;padding:3px 10px;
        border-radius:9999px;border:1px solid #f5d87a;">额度不足提醒</span>
</p>

<h2 class="email-fg-text" style="margin:0 0 6px 0;font-size:20px;font-weight:600;color:%s;">%s</h2>
<p class="email-muted-text" style="margin:0 0 20px 0;font-size:14px;color:%s;line-height:1.6;">
  当前剩余额度为 <strong style="color:%s;">%s</strong>，为了不影响您的正常使用，请及时充值。
</p>

<p style="margin:0 0 20px 0;">%s</p>

<p class="email-muted-text" style="margin:0;font-size:13px;color:%s;line-height:1.6;">
  充值链接：<a href="%s" style="color:%s;">%s</a>
</p>`,
		emailColorWarning,
		emailColorFg, prompt,
		emailColorMutedFg,
		emailColorFg, quotaStr,
		btn,
		emailColorMutedFg, topUpLink, emailColorFg, topUpLink,
	)
	return BuildEmailHTML(systemName, body, true)
}

// BuildChannelStatusEmailContent returns the HTML body for channel-disable/enable notifications.
func BuildChannelStatusEmailContent(systemName, channelName string, channelId int, disabled bool, reason string) string {
	var badgeBg, badgeColor, badgeBorder, statusColor, statusText string
	var consoleLink string
	if disabled {
		badgeBg = "#fff0f0"
		badgeColor = emailColorDestr
		badgeBorder = "#fca5a5"
		statusColor = emailColorDestr
		statusText = "已禁用"
		consoleLink = ServerAddress + "/console/channel"
	} else {
		badgeBg = "#f0fff8"
		badgeColor = emailColorSuccess
		badgeBorder = "#6ee7b7"
		statusColor = emailColorSuccess
		statusText = "已启用"
		consoleLink = ServerAddress + "/console/channel"
	}

	reasonRow := ""
	if reason != "" {
		reasonRow = fmt.Sprintf(`
  <tr class="email-detail-border" style="border-top:1px solid %s;">
    <td style="padding:10px 14px;color:%s;vertical-align:top;">禁用原因</td>
    <td class="email-fg-text" style="padding:10px 14px;color:%s;">%s</td>
  </tr>`, emailColorBorder, emailColorMutedFg, emailColorFg, reason)
	}

	btn := emailBtn("前往管理后台", consoleLink, emailColorPrimary, emailColorPrimaryFg)

	body := fmt.Sprintf(`
<p style="margin:0 0 16px 0;">
  <span style="display:inline-block;background:%s;color:%s;
        font-size:12px;font-weight:500;padding:3px 10px;
        border-radius:9999px;border:1px solid %s;">通道%s</span>
</p>

<h2 class="email-fg-text" style="margin:0 0 6px 0;font-size:20px;font-weight:600;color:%s;">通道状态变更通知</h2>
<p class="email-muted-text" style="margin:0 0 20px 0;font-size:14px;color:%s;line-height:1.6;">
  以下通道状态已变更，请登录管理后台检查并处理。
</p>

<table class="email-detail-border" width="100%%" cellpadding="0" cellspacing="0" role="presentation"
       style="border:1px solid %s;border-radius:6px;overflow:hidden;margin-bottom:20px;font-size:13px;">
  <tr class="email-detail-row-alt" style="background:%s;">
    <td style="padding:10px 14px;color:%s;width:90px;white-space:nowrap;">通道名称</td>
    <td class="email-fg-text" style="padding:10px 14px;color:%s;font-weight:500;">%s</td>
  </tr>
  <tr class="email-detail-border" style="border-top:1px solid %s;">
    <td style="padding:10px 14px;color:%s;">通道 ID</td>
    <td class="email-fg-text" style="padding:10px 14px;color:%s;">#%d</td>
  </tr>
  <tr class="email-detail-row-alt email-detail-border" style="background:%s;border-top:1px solid %s;">
    <td style="padding:10px 14px;color:%s;">当前状态</td>
    <td style="padding:10px 14px;color:%s;font-weight:500;">%s</td>
  </tr>
  %s
</table>

<p style="margin:0 0 20px 0;">%s</p>`,
		badgeBg, badgeColor, badgeBorder, statusText,
		emailColorFg,
		emailColorMutedFg,
		emailColorBorder,
		emailColorMuted, emailColorMutedFg, emailColorFg, channelName,
		emailColorBorder, emailColorMutedFg, emailColorFg, channelId,
		emailColorMuted, emailColorBorder, emailColorMutedFg,
		statusColor, statusText,
		reasonRow,
		btn,
	)
	return BuildEmailHTML(systemName, body, true)
}

func generateMessageID() (string, error) {
	split := strings.Split(SMTPFrom, "@")
	if len(split) < 2 {
		return "", fmt.Errorf("invalid SMTP account")
	}
	domain := strings.Split(SMTPFrom, "@")[1]
	return fmt.Sprintf("<%d.%s@%s>", time.Now().UnixNano(), GetRandomString(12), domain), nil
}

func shouldUseSMTPLoginAuth() bool {
	if SMTPForceAuthLogin {
		return true
	}
	return isOutlookServer(SMTPAccount) || slices.Contains(EmailLoginAuthServerList, SMTPServer)
}

func getSMTPAuth() smtp.Auth {
	if shouldUseSMTPLoginAuth() {
		return LoginAuth(SMTPAccount, SMTPToken)
	}
	return smtp.PlainAuth("", SMTPAccount, SMTPToken, SMTPServer)
}

func SendEmail(subject string, receiver string, content string) error {
	if SMTPFrom == "" { // for compatibility
		SMTPFrom = SMTPAccount
	}
	id, err2 := generateMessageID()
	if err2 != nil {
		return err2
	}
	if SMTPServer == "" && SMTPAccount == "" {
		return fmt.Errorf("SMTP 服务器未配置")
	}
	encodedSubject := fmt.Sprintf("=?UTF-8?B?%s?=", base64.StdEncoding.EncodeToString([]byte(subject)))
	mail := []byte(fmt.Sprintf("To: %s\r\n"+
		"From: %s <%s>\r\n"+
		"Subject: %s\r\n"+
		"Date: %s\r\n"+
		"Message-ID: %s\r\n"+ // 添加 Message-ID 头
		"Content-Type: text/html; charset=UTF-8\r\n\r\n%s\r\n",
		receiver, SystemName, SMTPFrom, encodedSubject, time.Now().Format(time.RFC1123Z), id, content))
	auth := getSMTPAuth()
	addr := fmt.Sprintf("%s:%d", SMTPServer, SMTPPort)
	to := strings.Split(receiver, ";")
	var err error
	if SMTPPort == 465 || SMTPSSLEnabled {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         SMTPServer,
		}
		conn, err := tls.Dial("tcp", fmt.Sprintf("%s:%d", SMTPServer, SMTPPort), tlsConfig)
		if err != nil {
			return err
		}
		client, err := smtp.NewClient(conn, SMTPServer)
		if err != nil {
			return err
		}
		defer client.Close()
		if err = client.Auth(auth); err != nil {
			return err
		}
		if err = client.Mail(SMTPFrom); err != nil {
			return err
		}
		receiverEmails := strings.Split(receiver, ";")
		for _, receiver := range receiverEmails {
			if err = client.Rcpt(receiver); err != nil {
				return err
			}
		}
		w, err := client.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(mail)
		if err != nil {
			return err
		}
		err = w.Close()
		if err != nil {
			return err
		}
	} else {
		err = smtp.SendMail(addr, auth, SMTPFrom, to, mail)
	}
	if err != nil {
		SysError(fmt.Sprintf("failed to send email to %s: %v", receiver, err))
	}
	return err
}
