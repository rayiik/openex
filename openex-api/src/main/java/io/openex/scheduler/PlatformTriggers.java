package io.openex.scheduler;

import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import static org.quartz.CronScheduleBuilder.cronSchedule;
import static org.quartz.SimpleScheduleBuilder.repeatMinutelyForever;
import static org.quartz.TriggerBuilder.newTrigger;

@Component
public class PlatformTriggers {

    private PlatformJobDefinitions platformJobs;

    @Autowired
    public void setPlatformJobs(PlatformJobDefinitions platformJobs) {
        this.platformJobs = platformJobs;
    }

    @Bean
    public Trigger injectsExecutionTrigger() {
        return newTrigger()
                .forJob(platformJobs.getInjectsExecution())
                .withIdentity("InjectsExecutionTrigger")
                .withSchedule(cronSchedule("0 0/1 * * * ?")) // Every minute align on clock
                .build();

    }

    @Bean
    public Trigger comchecksExecutionTrigger() {
        return newTrigger()
                .forJob(platformJobs.getComchecksExecution())
                .withIdentity("ComchecksExecutionTrigger")
                .withSchedule(repeatMinutelyForever())
                .build();

    }
}
