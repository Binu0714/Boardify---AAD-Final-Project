package org.example.bordifybackend.service.impl;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Service;

@Service
public class PhoneNumberService {
    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    public String formatToE164(String localNumber, String defaultRegion) {
        try {
            // Tell the library to assume the number is from Sri Lanka ("LK")
            Phonenumber.PhoneNumber phoneNumber = phoneUtil.parse(localNumber, defaultRegion);

            if (phoneUtil.isValidNumber(phoneNumber)) {
                // If the number is valid, format it to the +94... standard
                return phoneUtil.format(phoneNumber, PhoneNumberUtil.PhoneNumberFormat.E164);
            }
        } catch (NumberParseException e) {
            System.err.println("Could not parse phone number: " + localNumber + ". Reason: " + e.getMessage());
        }
        return null; // Return null if the number is invalid or fails to parse
    }
}
