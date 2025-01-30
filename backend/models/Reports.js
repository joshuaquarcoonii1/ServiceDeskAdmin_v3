const express = require('express');
const mongoose = require('mongoose');
const toUpperCase = (str) => {
  return str.toUpperCase();
};const User = require('./User')


const ReportSchema = new mongoose.Schema({

  username:{type:String},
  complaint: { type: String, required: true },
  department: { type: String, required: true, },
  location: { type: String, required: true,set: toUpperCase },
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now },
  EscalatedAt:{type:Date,default:null},
  resolvedAt:{type: Date,default:null},
  remarks:{type:String,default:null},
  contact: { type:String, ref: User, required: true },
  verified: { type: Boolean, default: false }, // New field for verification
  verifiedAt: { type: Date, default: null },   // Timestamp for verification
  redoCount: { type: Number, default: 0 },     // Number of times the report has been redone 
  assignedUnit:{type:String,default:null},
});

const Report = mongoose.model('Report', ReportSchema,'Report');
module.exports = Report;