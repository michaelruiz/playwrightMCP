import { expect, type Locator, type Page } from '@playwright/test';

import type { PracticePlan } from '../config/environment.ts';

export interface SignInOptions {
  email: string;
  password: string;
  plan?: PracticePlan;
  notes?: string;
}

export class PracticePage {
  readonly page: Page;
  readonly shell: Locator;
  readonly heading: Locator;
  readonly cardGrid: Locator;
  readonly visibleCardCount: Locator;
  readonly taskCount: Locator;
  readonly modeLabel: Locator;
  readonly signInStatus: Locator;
  readonly preferencesStatus: Locator;
  readonly taskItems: Locator;
  readonly releaseDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shell = page.locator('main.shell');
    this.heading = page.getByRole('heading', { name: 'Signal Lab Practice Board' });
    this.cardGrid = page.locator('#card-grid');
    this.visibleCardCount = page.locator('#visible-card-count');
    this.taskCount = page.locator('#task-count');
    this.modeLabel = page.locator('#mode-label');
    this.signInStatus = page.locator('#sign-in-status');
    this.preferencesStatus = page.locator('#preferences-status');
    this.taskItems = page.locator('#task-list li');
    this.releaseDialog = page.getByRole('dialog', { name: 'Release Notes Summary' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/practice/');
    await expect(this.heading).toBeVisible();
    await expect(this.shell).toHaveAttribute('data-practice-ready', 'true');
  }

  async signIn({ email, password, plan = 'Starter', notes = '' }: SignInOptions): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByLabel('Workspace Plan').selectOption(plan);

    if (notes) {
      await this.page.getByLabel('Notes').fill(notes);
    }

    await this.page.getByRole('button', { name: 'Submit Sign-In' }).click();
  }

  async filterCards(query: string): Promise<void> {
    await this.page.getByRole('searchbox', { name: 'Search cards' }).fill(query);
    await this.page.getByRole('button', { name: 'Apply filter' }).click();
  }

  async addTask(name: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'New task' }).fill(name);
    await this.page.getByRole('button', { name: 'Add item' }).click();
  }

  async setCheckbox(name: string, checked: boolean): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name });
    if ((await checkbox.isChecked()) !== checked) {
      await checkbox.click();
    }
  }

  async openReleaseNotes(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open Release Notes' }).click();
  }

  async closeReleaseNotes(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close Release Notes' }).click();
  }

  cardHeading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  taskItem(name: string): Locator {
    return this.taskItems.filter({ hasText: name });
  }

  releaseDialogText(text: string): Locator {
    return this.releaseDialog.getByText(text);
  }
}
