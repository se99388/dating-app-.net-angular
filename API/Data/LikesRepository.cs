using System;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class LikesRepository(AppDbContext context) : ILikesRepository
{
    public void AddLike(MemberLike like)
    {
        context.Likes.Add(like);
    }

    public void DeleteLike(MemberLike like)
    {
        context.Likes.Remove(like);
    }

    public async Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId)
    {

        return await context.Likes
            .Where(ml => ml.SourceMemberId == memberId)
            .Select(ml => ml.TargetMemberId)
            .ToListAsync();
    }

    public async Task<MemberLike?> GetMemberLike(string sourceMemberId, string targetMemberId)
    {
        return await context.Likes
            .FindAsync(sourceMemberId, targetMemberId);
    }

    public async Task<PaginatedResult<Member>> GetMemberLikes(LikesParams likesParams)
    {
        var query = context.Likes.AsQueryable();
        IQueryable<Member> results;
        switch (likesParams.Predicate)
        {
            case "liked":
                results = query.Where(ml => ml.SourceMemberId == likesParams.MemberId).Select(ml => ml.TargetMember);
                break;
            case "likedBy":
                results = query.Where(ml => ml.TargetMemberId == likesParams.MemberId).Select(ml => ml.SourceMember);
                break;
            default: //mutual likes
                var likeIds = await GetCurrentMemberLikeIds(likesParams.MemberId);

                results = context.Likes
                .Where(ml => ml.TargetMemberId == likesParams.MemberId && likeIds.Contains(ml.SourceMemberId))
                .Select(ml => ml.SourceMember);
                break;
        }
        return await PaginationHelper.CreateAsync(results, likesParams.PageNumber, likesParams.PageSize);

    }

    public async Task<bool> SaveAllChanges()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
