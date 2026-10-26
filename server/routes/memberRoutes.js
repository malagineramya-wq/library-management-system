import express from 'express';
import {
  getMembers,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';

const router = express.Router();

router.route('/')
  .get(getMembers)
  .post(addMember);

router.route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(deleteMember);

export default router;
