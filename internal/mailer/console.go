package mailer

import (
	"context"
	"strings"

	"github.com/moul-dev/moul-dev/internal/logger"
)

type ConsoleProvider struct{}

func NewConsoleProvider() *ConsoleProvider {
	return &ConsoleProvider{}
}

func (p *ConsoleProvider) Name() string {
	return "console"
}

func (p *ConsoleProvider) Send(ctx context.Context, email *Email) error {
	logger.Info("========================================")
	logger.Info("[MAILER: CONSOLE LOG]")
	if email.FromName != "" {
		logger.Info("From:", "from", email.FromName+" <"+email.From+">")
	} else {
		logger.Info("From:", "from", email.From)
	}
	logger.Info("To:", "to", strings.Join(email.To, ", "))
	logger.Info("Subject:", "subject", email.Subject)
	if email.TextBody != "" {
		logger.Info("Text Body:", "text", email.TextBody)
	}
	if email.HTMLBody != "" {
		logger.Info("HTML Body:", "html", email.HTMLBody)
	}
	logger.Info("========================================")
	return nil
}
