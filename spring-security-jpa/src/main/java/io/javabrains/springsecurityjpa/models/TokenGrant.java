package io.javabrains.springsecurityjpa.models;


import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

public class TokenGrant {
	UserLoginCredentials user;
	UUID uuid;
	Calendar c;
	public TokenGrant(UUID uuid, UserLoginCredentials user) {
		this.uuid = uuid;
		this.user = user;
		this.c = Calendar.getInstance();
		this.c.add(Calendar.DATE, 1);
	}
	public boolean isValid() {
		return Calendar.getInstance().before(c);
	};
	public UUID getUUID() {
		return uuid;
	}
	public UserLoginCredentials getUser() {
		return user;
	}
}
