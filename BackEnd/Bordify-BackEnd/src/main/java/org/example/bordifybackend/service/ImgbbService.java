// Create this new file: ImgbbService.java
package org.example.bordifybackend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ImgbbService {

    // Injects the API key from your application.properties file
    @Value("${imgbb.api.key}")
    private String apiKey;

    private static final String IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

    /**
     * Uploads a file to ImgBB and returns the direct URL of the uploaded image.
     * @param file The image file (MultipartFile) to upload.
     * @return The direct URL of the image on ImgBB.
     * @throws RuntimeException if the upload fails for any reason.
     */
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        // RestTemplate is Spring's standard, easy-to-use tool for making HTTP requests
        RestTemplate restTemplate = new RestTemplate();

        // The request headers need to specify that we are sending form data
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // The body of the request is a "multipart" form, which can contain both text and files
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        try {
            // ImgBB requires the file to be sent as a byte array with a proper filename.
            // We create a special ByteArrayResource to handle this.
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("image", resource);
        } catch (IOException e) {
            // This error happens if the file can't be read from the initial request
            throw new RuntimeException("Could not read file for upload.", e);
        }

        // Build the final request URL with your API key as a query parameter
        String urlWithKey = IMGBB_UPLOAD_URL + "?key=" + apiKey;

        // Combine the body and headers into a single HTTP request entity
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Send the POST request to the ImgBB API and expect an ImgbbResponse object back
        ResponseEntity<ImgbbResponse> response = restTemplate.postForEntity(urlWithKey, requestEntity, ImgbbResponse.class);

        // Check the response from ImgBB
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().isSuccess()) {
            ImgbbData data = response.getBody().getData();
            if (data != null && data.getUrl() != null) {
                // If everything is successful, return the direct image URL
                return data.getUrl();
            }
        }

        // If the response was not successful, throw an error
        throw new RuntimeException("Failed to upload image to ImgBB. Status: " + response.getStatusCode() + ", Body: " + response.getBody());
    }
}


// =================================================================
// HELPER CLASSES FOR MAPPING THE JSON RESPONSE FROM IMGBB
// =================================================================
// These simple classes are used by RestTemplate and Jackson (the JSON library)
// to automatically convert the JSON response from ImgBB into Java objects.

@Data // Lombok for getters/setters
class ImgbbResponse {
    private ImgbbData data;
    private boolean success;
    private int status;
}

@Data // Lombok for getters/setters
class ImgbbData {
    private String id;
    private String title;

    @JsonProperty("url_viewer") // Maps the 'url_viewer' field from JSON to this Java field
    private String urlViewer;

    private String url; // This is the direct link to the image file

    @JsonProperty("display_url")
    private String displayUrl;

    private int size;
    private long time;
    private long expiration;

    private ImgbbImage image;
    private ImgbbImage thumb;
    private ImgbbImage medium;

    @JsonProperty("delete_url")
    private String deleteUrl;
}

@Data // Lombok for getters/setters
class ImgbbImage {
    private String filename;
    private String name;
    private String mime;
    private String extension;
    private String url;
}