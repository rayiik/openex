package io.openex.rest.settings;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Setting;
import io.openex.database.model.Setting.SETTING_KEYS;
import io.openex.database.model.User;
import io.openex.database.repository.SettingRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.settings.form.SettingsUpdateInput;
import io.openex.rest.settings.response.OAuthProvider;
import io.openex.rest.settings.response.PlatformSetting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.currentUser;
import static io.openex.database.model.Setting.SETTING_KEYS.*;
import static io.openex.database.model.User.ROLE_ADMIN;
import static java.util.Optional.ofNullable;

@RestController
public class SettingsApi extends RestBehavior {

    private SettingRepository settingRepository;
    private ApplicationContext context;
    private Environment env;

    @Resource
    private OpenExConfig openExConfig;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setSettingRepository(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Autowired
    public void setEnv(Environment env) {
        this.env = env;
    }

    private List<OAuthProvider> buildProviders() {
        try {
            OAuth2ClientProperties properties = context.getBean(OAuth2ClientProperties.class);
            Map<String, OAuth2ClientProperties.Provider> providers = properties.getProvider();
            return providers.keySet().stream()
                    .map(s -> {
                        String providerLogin = env.getProperty("openex.provider." + s + ".login", "Login with " + s);
                        return new OAuthProvider(s, "/oauth2/authorization/" + s, providerLogin);
                    })
                    .toList();
        } catch (Exception e) {
            // No provider defined in the configuration
            return new ArrayList<>();
        }
    }

    private PlatformSetting buildPlatformSetting(Map<String, Setting> dbSettings, SETTING_KEYS setting) {
        Optional<Setting> platformName = ofNullable(dbSettings.get(setting.key()));
        String settingValue = platformName.map(Setting::getValue).orElse(setting.defaultValue());
        return new PlatformSetting(setting.key(), settingValue);
    }

    private Map<String, Setting> mapOfSettings() {
        return fromIterable(settingRepository.findAll()).stream().collect(
                Collectors.toMap(Setting::getKey, Function.identity()));
    }

    private Setting resolveFromMap(Map<String, Setting> dbSettings, SETTING_KEYS setting, String value) {
        Optional<Setting> optionalSetting = ofNullable(dbSettings.get(setting.key()));
        if (optionalSetting.isPresent()) {
            Setting updateSetting = optionalSetting.get();
            updateSetting.setValue(value);
            return updateSetting;
        }
        return new Setting(setting.key(), value);
    }

    @GetMapping("/api/settings")
    public List<PlatformSetting> settings() {
        List<PlatformSetting> settings = new ArrayList<>();
        // Get setting from database
        Map<String, Setting> dbSettings = mapOfSettings();
        // Build anonymous settings
        settings.add(new PlatformSetting("platform_providers", buildProviders()));
        settings.add(new PlatformSetting("auth_openid_enable", openExConfig.isAuthOpenidEnable()));
        settings.add(new PlatformSetting("auth_local_enable", openExConfig.isAuthLocalEnable()));
        settings.add(buildPlatformSetting(dbSettings, DEFAULT_THEME));
        settings.add(buildPlatformSetting(dbSettings, DEFAULT_LANG));
        // Build authenticated user settings
        User user = currentUser();
        if (user != null) {
            settings.add(new PlatformSetting("map_tile_server_light", openExConfig.getMapTileServerLight()));
            settings.add(new PlatformSetting("map_tile_server_dark", openExConfig.getMapTileServerDark()));
            settings.add(buildPlatformSetting(dbSettings, PLATFORM_NAME));
            // Build admin settings
            if (user.isAdmin()) {
                settings.add(new PlatformSetting("platform_version", openExConfig.getVersion()));
                settings.add(new PlatformSetting("postgre_version", settingRepository.getServerVersion()));
                settings.add(new PlatformSetting("java_version", Runtime.version().toString()));
            }
        }
        return settings;
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/settings")
    public List<PlatformSetting> updateSettings(@Valid @RequestBody SettingsUpdateInput input) {
        Map<String, Setting> dbSettings = mapOfSettings();
        List<Setting> settingsToSave = new ArrayList<>();
        settingsToSave.add(resolveFromMap(dbSettings, PLATFORM_NAME, input.getName()));
        settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_THEME, input.getTheme()));
        settingsToSave.add(resolveFromMap(dbSettings, DEFAULT_LANG, input.getLang()));
        settingRepository.saveAll(settingsToSave);
        return settings();
    }
}
