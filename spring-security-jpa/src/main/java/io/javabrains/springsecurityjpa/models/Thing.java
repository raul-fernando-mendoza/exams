package io.javabrains.springsecurityjpa.models;

import javax.persistence.*;

@Entity
@Table(name = "Thing")
public class Thing {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String thingName;
    
    public Thing(String thingName){
    	this.thingName = thingName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getThingName() {
        return thingName;
    }

    public void setUserName(String thingName) {
        this.thingName = thingName;
    }

}
