<template>
  <div class="qa-grid">
    <div v-for="(item, idx) in qaList" :key="idx" class="qa-card">
      <div class="qa-q">
        <span class="qa-badge">Q</span>
        <span class="qa-text">{{ item.q }}</span>
      </div>
      <div class="qa-a">{{ item.a }}</div>
    </div>
  </div>
</template>

<script setup>
const qaList = [
  {
    q: '有些什么爱好？',
    a: '平时有空喜欢去一些没有到达过的新奇地点，喜欢自然，心怡山水。资深小说党，喜欢看大世界观、每个族群为自身发展而努力；lv2 小说作家，为爱发电。'
  },
  {
    q: '家庭如何？',
    a: '我有与我相爱的妻子、可爱的孩子。如果可以的话，现在极其想和你分享我家的小宝。'
  },
  {
    q: '对事业的看法？',
    a: '事业是生活中人所实现自身价值的直接途径，失去自身的事业，人会变得极其空虚。'
  },
  {
    q: '对工作的看法？',
    a: '工作本身是对彼此的服侍，所有人共同组成一个和谐的社会。工作和事业本质是不同的概念，工作是我们完成自身事业的直接途径。'
  },
  {
    q: '对人性的看法？',
    a: '人性是极其复杂的矛盾体，在抉择中有得有失。但我仍然相信大多数人是善良的，因为人类社会的法律、道德体系。至于人性本身，不可解，不可查。'
  }
]
</script>

<style scoped>
.qa-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .qa-grid {
    grid-template-columns: 1fr;
  }
}

.qa-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  transition: all 0.3s ease;
}

.qa-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.qa-q {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
}

.qa-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.qa-a {
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.92rem;
}
</style>
