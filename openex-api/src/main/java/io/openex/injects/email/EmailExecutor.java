package io.openex.injects.email;

import io.openex.contract.Contract;
import io.openex.database.model.Document;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectDocument;
import io.openex.execution.Injector;
import io.openex.execution.ExecutableInject;
import io.openex.database.model.Execution;
import io.openex.execution.ExecutionContext;
import io.openex.injects.email.model.EmailContent;
import io.openex.injects.email.service.EmailService;
import io.openex.injects.email.service.ImapService;
import io.openex.database.model.DataAttachment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.mail.internet.MimeMessage;
import java.util.List;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.database.model.ExecutionTrace.traceSuccess;
import static io.openex.injects.email.EmailContract.EMAIL_GLOBAL;
import static java.util.stream.Collectors.joining;

@Component("openex_email")
public class EmailExecutor extends Injector {

    private EmailService emailService;

    @Value("${openex.mail.imap.enabled}")
    private boolean imapEnabled;

    private ImapService imapService;

    @Autowired
    public void setImapService(ImapService imapService) {
        this.imapService = imapService;
    }

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    private void storeMessageImap(Execution execution, MimeMessage mimeMessage) {
        if (imapEnabled) {
            try {
                imapService.storeSentMessage(mimeMessage);
                execution.addTrace(traceSuccess("imap", "Mail stored in imap"));
            } catch (Exception e) {
                execution.addTrace(traceError("imap", e.getMessage(), e));
            }
        }
    }

    private void sendMulti(Execution execution, List<ExecutionContext> users, String replyTo, String subject,
                           String message, List<DataAttachment> attachments) {
        MimeMessage mimeMessage = null;
        String emails = users.stream().map(c -> c.getUser().getEmail()).collect(joining(", "));
        try {
            mimeMessage = emailService.sendEmail(users, replyTo, subject, message, attachments);
            execution.addTrace(traceSuccess("email", "Mail sent to " + emails));
        } catch (Exception e) {
            execution.addTrace(traceError("email", e.getMessage(), e));
        }
        storeMessageImap(execution, mimeMessage);
    }

    private void sendSingle(Execution execution, List<ExecutionContext> users, String replyTo, boolean mustBeEncrypted,
                            String subject, String message, List<DataAttachment> attachments) {
        users.stream().parallel().forEach(userInjectContext -> {
            MimeMessage mimeMessage = null;
            String email = userInjectContext.getUser().getEmail();
            try {
                mimeMessage = emailService.sendEmail(userInjectContext, replyTo, mustBeEncrypted, subject, message, attachments);
                execution.addTrace(traceSuccess("email", "Mail sent to " + email));
            } catch (Exception e) {
                execution.addTrace(traceError("email", e.getMessage(), e));
            }
            storeMessageImap(execution, mimeMessage);
        });
    }

    @Override
    public void process(Execution execution, ExecutableInject injection, Contract contract) throws Exception {
        Inject inject = injection.getInject();
        EmailContent content = contentConvert(injection, EmailContent.class);
        List<Document> documents = inject.getDocuments().stream()
                .filter(InjectDocument::isAttached)
                .map(InjectDocument::getDocument).toList();
        List<DataAttachment> attachments = resolveAttachments(execution, documents);
        String subject = content.getSubject();
        String message = content.buildMessage(inject, imapEnabled);
        boolean mustBeEncrypted = content.isEncrypted();
        // Resolve the attachments only once
        List<ExecutionContext> users = injection.getUsers();
        if (users.size() == 0) {
            throw new UnsupportedOperationException("Email needs at least one user");
        }
        Exercise exercise = injection.getSource().getExercise();
        String replyTo = exercise.getReplyTo();
        //noinspection SwitchStatementWithTooFewBranches
        switch (contract.getId()) {
            case EMAIL_GLOBAL -> sendMulti(execution, users, replyTo, subject, message, attachments);
            default -> sendSingle(execution, users, replyTo, mustBeEncrypted, subject, message, attachments);
        }
    }
}
