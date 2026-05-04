package com.example.JanAwaaz.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeGrievanceImage(MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        if (imageFile.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image file size must be 10 MB or less");
        }

        Path grievanceUploadPath = Paths.get(uploadDir, "grievances").toAbsolutePath().normalize();
        String extension = resolveExtension(imageFile.getOriginalFilename(), contentType);
        String storedFileName = UUID.randomUUID() + extension;
        Path destination = grievanceUploadPath.resolve(storedFileName).normalize();

        if (!destination.startsWith(grievanceUploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image file path");
        }

        try {
            Files.createDirectories(grievanceUploadPath);
            Files.copy(imageFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store grievance image");
        }

        return "/uploads/grievances/" + storedFileName;
    }

    private String resolveExtension(String originalFilename, String contentType) {
        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (StringUtils.hasText(extension)) {
            return "." + extension.toLowerCase(Locale.ROOT);
        }

        return CONTENT_TYPE_EXTENSIONS.getOrDefault(contentType.toLowerCase(Locale.ROOT), ".img");
    }
}
