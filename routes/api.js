'use strict';

// In-memory database for storing issues
const issues = {};

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
      // Initialize project if it doesn't exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      // Get all issues for the project
      let projectIssues = issues[project];
      
      // Filter by query parameters
      const filters = req.query;
      let filteredIssues = projectIssues.filter(issue => {
        for (let key in filters) {
          // Convert string 'true'/'false' to boolean for open field
          let filterValue = filters[key];
          if (key === 'open') {
            filterValue = filterValue === 'true';
          }
          if (issue[key] != filterValue) {
            return false;
          }
        }
        return true;
      });
      
      res.json(filteredIssues);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      // Initialize project if it doesn't exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      // Validate required fields
      const { issue_title, issue_text, created_by } = req.body;
      
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      // Create new issue
      const newIssue = {
        _id: generateId(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true
      };
      
      issues[project].push(newIssue);
      res.json(newIssue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
      // Check if _id is provided
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
      
      const _id = req.body._id;
      
      // Initialize project if it doesn't exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      // Find the issue
      const issue = issues[project].find(i => i._id === _id);
      
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }
      
      // Check if there are fields to update
      const updateFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      const hasUpdates = updateFields.some(field => {
        if (req.body.hasOwnProperty(field)) {
          // Field exists in request body
          if (field === 'open') {
            return true; // open field is always valid if present
          }
          return req.body[field] !== undefined && req.body[field] !== '';
        }
        return false;
      });
      
      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      
      // Update the issue
      updateFields.forEach(field => {
        if (req.body.hasOwnProperty(field)) {
          if (field === 'open') {
            issue[field] = req.body[field] === 'true' || req.body[field] === true;
          } else if (req.body[field] !== '') {
            issue[field] = req.body[field];
          }
        }
      });
      
      issue.updated_on = new Date().toISOString();
      
      res.json({ result: 'successfully updated', _id });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      // Check if _id is provided
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
      
      const _id = req.body._id;
      
      // Initialize project if it doesn't exist
      if (!issues[project]) {
        issues[project] = [];
      }
      
      // Find the index of the issue
      const index = issues[project].findIndex(i => i._id === _id);
      
      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }
      
      // Delete the issue
      issues[project].splice(index, 1);
      
      res.json({ result: 'successfully deleted', _id });
    });
    
};
