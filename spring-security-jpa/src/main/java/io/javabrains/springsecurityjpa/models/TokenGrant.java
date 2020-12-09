package io.javabrains.springsecurityjpa.models;


import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

public class TokenGrant {
	MyUserDetails user;
	UUID uuid;
	Calendar c;
	public TokenGrant(UUID uuid, MyUserDetails user) {
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
	public MyUserDetails getUser() {
		return user;
	}
}
