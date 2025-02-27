package io.openex.rest.audience;

import io.openex.database.model.Audience;
import io.openex.database.model.Exercise;
import io.openex.database.model.User;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.database.specification.AudienceSpecification;
import io.openex.rest.audience.form.AudienceCreateInput;
import io.openex.rest.audience.form.AudienceUpdateActivationInput;
import io.openex.rest.audience.form.AudienceUpdateInput;
import io.openex.rest.audience.form.UpdateUsersAudienceInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
@RolesAllowed(ROLE_USER)
public class AudienceApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private AudienceRepository audienceRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Audience> getAudiences(@PathVariable String exerciseId) {
        return audienceRepository.findAll(AudienceSpecification.fromExercise(exerciseId));
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Audience getAudience(@PathVariable String exerciseId, @PathVariable String audienceId) {
        return audienceRepository.findById(audienceId).orElseThrow();
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/players")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<User> getAudiencePlayers(@PathVariable String exerciseId, @PathVariable String audienceId) {
        return audienceRepository.findById(audienceId).orElseThrow().getUsers();
    }

    @PostMapping("/api/exercises/{exerciseId}/audiences")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Audience createAudience(@PathVariable String exerciseId,
                                   @Valid @RequestBody AudienceCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Audience audience = new Audience();
        audience.setUpdateAttributes(input);
        audience.setExercise(exercise);
        audience.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return audienceRepository.save(audience);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteAudience(@PathVariable String exerciseId, @PathVariable String audienceId) {
        audienceRepository.deleteById(audienceId);
    }

    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Audience updateAudience(@PathVariable String exerciseId,
                                   @PathVariable String audienceId,
                                   @Valid @RequestBody AudienceUpdateInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        audience.setUpdateAttributes(input);
        audience.setUpdatedAt(now());
        audience.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return audienceRepository.save(audience);
    }

    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/players")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Audience updateAudienceUsers(
            @PathVariable String exerciseId,
            @PathVariable String audienceId,
            @Valid @RequestBody UpdateUsersAudienceInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        Iterable<User> audienceUsers = userRepository.findAllById(input.getUserIds());
        audience.setUsers(fromIterable(audienceUsers));
        return audienceRepository.save(audience);
    }

    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/activation")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Audience updateAudienceActivation(
            @PathVariable String exerciseId,
            @PathVariable String audienceId,
            @Valid @RequestBody AudienceUpdateActivationInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        audience.setEnabled(input.isEnabled());
        return audienceRepository.save(audience);
    }
}
