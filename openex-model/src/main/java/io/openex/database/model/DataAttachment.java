package io.openex.database.model;

public record DataAttachment(String name, byte[] data, String contentType) {
    // Nothing special
}
