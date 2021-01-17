# ami

## Command 
```
curl \ 
        --user your-API-TOKEN: \ 
        --header "Content-Type: application/json" \ 
        --data "{\"build_parameters\": {\"CIRCLE_JOB\": \"build-ami\"}}" \ 
         --request POST "https://circleci.com/api/v1.1/project/github/github-name/repository-name/tree/branch-name" 
``` 


