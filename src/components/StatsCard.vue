<template>
  <div class="stats rounded-none">
    <div class="stat border-black border-r-2">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <div class="w-16 rounded-full">
            <img src="../assets/profile-picture.jpg" />
          </div>
        </div>
      </div>
      <div class="stat-value text-black text-xl">{{ observedUser.username }}</div>
      <div class="stat-title text-md">Status:</div>
      <div class="stat-desc text-[#62D49A]">{{ observedUser.status }}</div>
    </div>

    <div class="stat border-none">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="icon-park-outline:ranking"
          style="color: #5d4df8"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Rank</div>
      <div class="stat-value text-primary">{{ observedUser.rank }}</div>
    </div>

    <div class="stat border-black !border-l-2">
      <div class="stat-figure text-primary">
        <iconify-icon
          class="w-10 h-10"
          icon="mdi:target-arrow"
          style="color: #5d4df8"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Win Rate</div>
      <div class="stat-value text-primary">{{ observedUser.win_rate }} %</div>
    </div>

    <div class="stat border-black !border-l-2">
      <div class="stat-figure text-primary tooltip tooltip-top" data-tip="Add friend">
        <iconify-icon
          class="w-10 h-10"
          :icon="hoverIcon"
          style="color: #5d4df8"
          @mouseover="hoverIcon = 'mdi:account-plus'"
          @mouseout="hoverIcon = 'mdi:account-plus-outline'"
        ></iconify-icon>
      </div>
      <div class="stat-value text-xl">Friends</div>
      <div class="stat-value text-primary">{{ observedUser.n_friends }}</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'StatsCard',
  data() {
    return {
      // hover: false,
      hoverIcon: 'mdi:account-plus-outline',
      observedUser: {
        id: 3,
        username: 'Mitsun0bu',
        email: '',
        password: '',
        profile_picture: '',
        status: 'Online',
        rank: 4,
        games_played: 10,
        win: 2,
        loss: 8,
        win_rate: 20,
        points_scored: 4,
        points_conceded: 25,
        points_difference: -21,
        friends: [],
        n_friends: 0
      }
    }
  },
  methods: {}
}
</script>
