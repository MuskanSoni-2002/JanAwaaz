package com.example.JanAwaaz.config;

import com.example.JanAwaaz.model.Officer;
import com.example.JanAwaaz.repository.OfficerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LegacyOfficerPasswordMigrationTest {

    @Test
    void migratesOnlyLegacySampleOfficerPasswords() throws Exception {
        OfficerRepository officerRepository = mock(OfficerRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        Officer legacyOfficer = new Officer();
        legacyOfficer.setPassword(LegacyOfficerPasswordMigration.LEGACY_SAMPLE_OFFICER_HASH);

        Officer currentOfficer = new Officer();
        currentOfficer.setPassword("$2a$12$current-password-hash");

        when(officerRepository.findAll()).thenReturn(List.of(legacyOfficer, currentOfficer));
        when(passwordEncoder.encode("Officer@123")).thenReturn("$2a$12$new-password-hash");

        LegacyOfficerPasswordMigration migration =
                new LegacyOfficerPasswordMigration(officerRepository, passwordEncoder, "Officer@123");

        migration.run(new DefaultApplicationArguments(new String[0]));

        assertNotEquals(
                LegacyOfficerPasswordMigration.LEGACY_SAMPLE_OFFICER_HASH,
                legacyOfficer.getPassword()
        );
        assertTrue(currentOfficer.getPassword().startsWith("$2a$12$current-password-hash"));
        verify(officerRepository).saveAll(anyList());
    }

    @Test
    void skipsSaveWhenNoLegacySamplePasswordExists() throws Exception {
        OfficerRepository officerRepository = mock(OfficerRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        Officer currentOfficer = new Officer();
        currentOfficer.setPassword("$2a$12$current-password-hash");

        when(officerRepository.findAll()).thenReturn(List.of(currentOfficer));

        LegacyOfficerPasswordMigration migration =
                new LegacyOfficerPasswordMigration(officerRepository, passwordEncoder, "Officer@123");

        migration.run(new DefaultApplicationArguments(new String[0]));

        verify(officerRepository, never()).saveAll(anyList());
    }
}
