import { Request, Response, Express } from 'express';
import { User } from '../types/user';
import { ensureAuthenticated } from '../utils/utils';
import tagService from '../services/tagService';

/**
 * API
 */
const tagController = (serv: Express) => {
  /**
   * @apiName TagList
   * @apiGroup Tag
   * @api {GET} /ebd/tag Get all tag available for current user
   *
   * @apiDescription Return list of all available tag
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.get('/ebd/tag', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await tagService.getUserTags((req.user as User).id.toString());
    res.status(result ? 200 : 400).send(result);
  });

  /**
   * @apiName TagAdd
   * @apiGroup Tag
   * @api {POST} /ebd/tag Add a new tag for this user
   * 
   * @apiBody {Tag} tag The tag to be added
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.post('/ebd/tag', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await tagService.addUserTag(req.body.tag, (req.user as User).id.toString());
    res.status(result ? 200 : 400).send(result);
  });

  /**
   * @apiName TagDelete
   * @apiGroup Tag
   * @api {DELETE} /ebd/tag Delete a tag for this user
   *
   * @apiBody {Tag} tag The tag to be deleted
   * @apiError (401) {null} UserNotAuthenticated
   */
  serv.post('/ebd/tag/delete', ensureAuthenticated, async (req: Request, res: Response) => {
    const result = await tagService.deleteUserTag(req.body.tag, (req.user as User).id.toString());
    res.status(result ? 200 : 400).send(result);
  });
};

export default tagController;
