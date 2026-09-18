import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test } from 'vitest'
import PaymentHistoryPage from '@/views/PaymentHistoryPage.vue'

describe('PaymentHistoryPage.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('shows saved payments when the store is initialized from localStorage', async () => {
    const savedDebts = [
      {
        id: 'debt-1',
        name: 'Car Loan',
        person: 'Sam',
        direction: 'owe',
        type: 'one_time',
        originalAmount: 1000,
        remainingAmount: 0,
        payments: [
          {
            id: 'payment-1',
            amount: 250,
            paidAt: '2026-09-19T10:00:00.000Z',
            note: 'First installment',
          },
        ],
        status: 'active',
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-19T10:00:00.000Z',
      },
    ]

    localStorage.setItem('debt_tracker_debts', JSON.stringify(savedDebts))

    const wrapper = mount(PaymentHistoryPage)

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Car Loan')
    expect(wrapper.text()).toContain('First installment')
    expect(wrapper.text()).not.toContain('No Payments Yet')
  })
})
