## Todos 
- [x] Initial Response should stream tool calls, messages, and statuses updates in one message. Other agent responses will reference the data in the initial response OR call the tools if requested.
    - [x] Separate Tools 
    - [x] show statuses on tool calls and have a structured response.
    - [x] write a basic Presentation View after ranking.
- [x] Base Output View (use a table for now)
- [x] MAKE A Tool to render candidates (so agent doesn't reference someone not knowing he/she wasn't shown bef)
- [ ] Artifact Trigger
- [x] Store Candidates and maybe the JD in Agent's context.3
- [x] Get Profile by ID
- [x] Show Detailed Profile, in `/profile` view, includes resume
- [x] Ranking Algorithm, Design a an algo to weight different things while ranking (needs recruiter input, then add it to sys prompt)
- [x] Complete Response View
- [ ] Support `numOfTalent` (maybe in extract_query with a default)
- [x] Do the `.env` thing (the extra sb keys)
- [ ] Make Border var Darker

## Imporovements 
- [x] Increase Prompt input body size
- [x] Handle Agent Empty States, returns or (I don't know)
