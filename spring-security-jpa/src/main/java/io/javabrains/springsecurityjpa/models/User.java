package io.javabrains.springsecurityjpa.models;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.persistence.*;

@Entity
@Table(name = "User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String userName;
    private String password;
    private boolean active;
    
    @OneToMany(fetch = FetchType.EAGER,  cascade = CascadeType.ALL)
	private Collection<Role> Roles= new ArrayList<Role>();

	public Collection<Role> getRoles() {
		return Roles;
	}

	public void setRoles(Collection<Role> roles) {
		Roles = roles;
	}

	public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }




}
