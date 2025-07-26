### Flowchart
  ```mermaid
    graph TD
    A[Client] --> B[Load Balancer]
```

  ```mermaid
    graph TD
    A --> B;
    A --> C;
    B --> D;
    C --> D;
```
### Sequence diagrams
  ```mermaid
	sequenceDiagram
		participant Alice
		participant Bob
		Alice->>John: Hallo John
		loop Healthcheck
			John->>John: AIDS
		end 
		Note right of John: rrrrrrrrrrr <br/>Texxxxt!
		John-->>Alice: Gut
		John->>Bob: penis
		Bob->>John: Hund
```

### Gantt diagram 
### Class diagram 
### Git graph 
### Entity Realationship Diagram 
### User Journey Diagram