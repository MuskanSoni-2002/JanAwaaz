package com.example.JanAwaaz.config;

import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LegacyOfficerPasswordMigration implements ApplicationRunner {
    static final String LEGACY_SAMPLE_OFFICER_HASH =
            "$2a$10$7EqJtq98hPqEX7fNZaFWoOhiB8e7fowA1a5YlHppZArYrusS4x.mG";

    private static final Logger log = LoggerFactory.getLogger(LegacyOfficerPasswordMigration.class);

    private final OfficerRepository officerRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultOfficerPassword;

    public LegacyOfficerPasswordMigration(
            OfficerRepository officerRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.sample-officers.default-password:Officer@123}") String defaultOfficerPassword
    ) {
        this.officerRepository = officerRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultOfficerPassword = defaultOfficerPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Officer> officersToMigrate = officerRepository.findAll().stream()
                .filter(this::usesLegacySamplePassword)
                .toList();

        if (officersToMigrate.isEmpty()) {
            return;
        }

        officersToMigrate.forEach(officer -> officer.setPassword(passwordEncoder.encode(defaultOfficerPassword)));
        officerRepository.saveAll(officersToMigrate);

        log.warn(
                "Migrated {} legacy sample officer account(s) to the configured default password. " +
                        "Update those credentials after login.",
                officersToMigrate.size()
        );
    }

    private boolean usesLegacySamplePassword(Officer officer) {
        return officer != null && LEGACY_SAMPLE_OFFICER_HASH.equals(officer.getPassword());
    }
}
