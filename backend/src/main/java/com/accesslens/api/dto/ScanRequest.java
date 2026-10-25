package com.accesslens.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ScanRequest {

    @NotBlank(message = "URL must not be blank")
    @Size(max = 2048, message = "URL must not exceed 2048 characters")
    @Pattern(
        regexp = "^https?://.*",
        message = "URL must start with http:// or https://"
    )
    private String url;

    public ScanRequest() {}
    public ScanRequest(String url) { this.url = url; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
