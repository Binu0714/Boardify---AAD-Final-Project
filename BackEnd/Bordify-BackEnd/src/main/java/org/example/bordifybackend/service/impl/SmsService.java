package org.example.bordifybackend.service.impl;

import com.vonage.client.VonageClient;
import com.vonage.client.sms.MessageStatus;
import com.vonage.client.sms.SmsSubmissionResponse;
import com.vonage.client.sms.messages.TextMessage;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    // These read the API Key and Secret from your application.properties
    @Value("${vonage.api.key}")
    private String apiKey;

    @Value("${vonage.api.secret}")
    private String apiSecret;

    private VonageClient client;

    // This method runs once to initialize the Vonage client
    @PostConstruct
    public void init() {
        this.client = VonageClient.builder().apiKey(apiKey).apiSecret(apiSecret).build();
    }

    public void sendSms(String to, String body) {
        try {
            // "Boardify" will be the sender ID
            TextMessage message = new TextMessage("Boardify", to, body);
            SmsSubmissionResponse response = client.getSmsClient().submitMessage(message);

            if (response.getMessages().get(0).getStatus() == MessageStatus.OK) {
                System.out.println("Message sent successfully to " + to);
            } else {
                System.err.println("Message failed with status: " + response.getMessages().get(0).getErrorText());
            }
        } catch (Exception e) {
            System.err.println("Error sending SMS via Vonage: " + e.getMessage());
        }
    }
}