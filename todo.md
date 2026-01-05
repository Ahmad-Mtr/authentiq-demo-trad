## Todos 
- [x] Initial Response should stream tool calls, messages, and statuses updates in one message. Other agent responses will reference the data in the initial response OR call the tools if requested.
    - [x] Separate Tools 
    - [x] show statuses on tool calls and have a structured response.
    - [x] write a basic Presentation View after ranking.
- [x] Base Output View (use a table for now)
- [x] MAKE A Tool to render candidates (so agent doesn't reference someone not knowing he/she wasn't shown bef)
- [ ] Artifact Trigger
- [ ] Store Candidates and maybe the JD in Agent's context.3
- [ ] Get Profile by ID
- [ ] Show Detailed Profile, in `/profile` view, includes resume
- [ ] Ranking Algorithm, Design a an algo to weight different things while ranking (needs recruiter input, then add it to sys prompt)
- [ ] Complete Response View
- [ ] Support `numOfTalent` (maybe in extract_query with a default)
- [ ] Do the `.env` thing (the extra sb keys)

## Imporovements 
- [ ] Increase Prompt input body size
- [ ] Handle Agent Empty States, returns or (I don't know)
