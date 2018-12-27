import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Proposals } from '../proposals.js';
// import { Promise } from 'meteor/promise';

Meteor.methods({
    'proposals.getProposals': function(){
        this.unblock();
        let url = LCD + '/gov/proposals';
        let response = HTTP.get(url);
        // console.log('resp',typeof response.content)
        let proposals = typeof response.content == 'string'?[]:JSON.parse(response.content);
        //  console.log(proposals);

        let proposalIds = [];
        if (proposals.length > 0){
            // Proposals.upsert()
            // console.log(proposals.length)
            const bulkProposals = Proposals.rawCollection().initializeUnorderedBulkOp();
            for (let i in proposals){
                let proposal = proposals[i];
                proposal.proposalId = parseInt(proposal.value.proposal_id);
                bulkProposals.find({proposalId: proposal.proposalId}).upsert().updateOne({$set:proposal});
                proposalIds.push(proposal.proposalId);
            }
            bulkProposals.find({proposalId:{$nin:proposalIds}}).update({$set:{"value.proposal_status":"Removed"}});
            bulkProposals.execute();
        }
        else{
            // console.log("insert response here")
            
        }


    }
})