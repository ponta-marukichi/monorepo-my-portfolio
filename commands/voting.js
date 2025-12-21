// ===== commands/voting.js =====
export default {
  name: 'v',
  aliases: ['vend'],
  description: '投票システム',
  usage: '!v (投票開始) | !vend (投票終了)',
  
  // 投票システムの状態を保持
  isVotingActive: false,
  votes: {},
  voters: new Set(),
  votingTimeout: null,
  
  async execute(client, channel, tags, message, args) {
    const commandName = message.split(' ')[0].substring(1).toLowerCase();
    
    if (commandName === 'v') {
      this.startVoting(client, channel);
    } else if (commandName === 'vend') {
      if (tags.mod || tags.username === channel.substring(1)) {
        this.endVoting(client, channel, true);
      }
    }
  },

  startVoting(client, channel) {
    if (this.isVotingActive) {
      client.say(channel, "A vote is already in progress!/ 投票はすでに進行中です！");
      return;
    }
    
    this.isVotingActive = true;
    this.votes = {};
    this.voters = new Set();
    
    client.say(channel, "Voting has started! Please submit a number from 1 to 10 within 3 minutes. Each user can vote only once./ 投票を開始しました！3分間で1から10までの数字を投稿してください。各ユーザーは1回のみ投票できます。");
    
    this.votingTimeout = setTimeout(() => {
      this.endVoting(client, channel, false);
    }, 3 * 60 * 1000);
  },

  endVoting(client, channel, manual = false) {
    if (!this.isVotingActive) {
      if (manual) {
        client.say(channel, "There is no ongoing vote at the moment./ 現在進行中の投票はありません。");
      }
      return;
    }
    
    this.isVotingActive = false;
    clearTimeout(this.votingTimeout);
    
    if (manual) {
      client.say(channel, "Voting is now closed./ 投票を終了します。");
    }
    
    if (this.voters.size === 0) {
      client.say(channel, "There were no votes./ 投票がありませんでした。");
      return;
    }
    
    const allVotes = Object.values(this.votes);
    const totalVotes = allVotes.reduce((sum, vote) => sum + vote, 0);
    const averageVote = totalVotes / allVotes.length;
    
    client.say(channel, `投票結果(Voting results): 参加者数(Number of participants): ${this.voters.size}人(voters), 合計(total): ${totalVotes}, 平均(average): ${averageVote.toFixed(2)}`);
  },

  handleVote(client, channel, tags, message) {
    if (!this.isVotingActive || !/^\d+$/.test(message.trim())) {
      return false;
    }

    const userId = tags['user-id'];
    const username = tags['display-name'];
    const voteValue = parseInt(message.trim(), 10);
    
    if (voteValue < 1 || voteValue > 10) {
      client.say(channel, `@${username} Only numbers from 1 to 10 are valid for voting./ 投票は1から10までの数字のみ有効です。`);
      return true;
    }
    
    if (this.voters.has(userId)) {
      client.say(channel, `@${username} You have already voted./ すでに投票済みです。`);
      return true;
    }
    
    this.votes[userId] = voteValue;
    this.voters.add(userId);
    
    client.say(channel, `@${username} の投票 (${voteValue}) を受け付けました！/ Your vote has been accepted.`);
    return true;
  }
};
