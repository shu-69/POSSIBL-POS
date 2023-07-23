import { Directive, QueryList, ElementRef, ContentChildren, AfterContentInit } from '@angular/core';
import { MovableDirective } from './moveable.directive';

interface Boundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

@Directive({
  selector: '[appMovableArea]'
})
export class MovableAreaDirective implements AfterContentInit {
  @ContentChildren(MovableDirective) movable!: QueryList<MovableDirective>;

  private boundaries!: Boundaries;
  private movableSubscribtion: any;
  constructor(private el: ElementRef) {}

  ngAfterContentInit(): void {

    this.movableSubscribtion = this.movable.changes.subscribe(() => {
      this.movable.forEach((movable: any) => {
        movable.dragStart.switchMap().subscribe(() => this.measureBoundaries(movable));
        movable.dragMove.switchMap(() => this.maintainBoundaries(movable));
      })
    })

    this.movable.notifyOnChanges();
  }

  private measureBoundaries(movable: MovableDirective) {
    const viewRect: ClientRect = this.el.nativeElement.getBoundingClientRect();
    const movableClientRect: ClientRect = movable.element.nativeElement.getBoundingClientRect();

    this.boundaries = {
      minX: viewRect.left - movableClientRect.left + movable.position.x,
      maxX: viewRect.right - movableClientRect.right + movable.position.x,
      minY: viewRect.top - movableClientRect.top + movable.position.y,
      maxY: viewRect.bottom - movableClientRect.bottom + movable.position.y
    }
  }

  private maintainBoundaries(movable: MovableDirective) {
    if (movable.position.x < this.boundaries.minX) movable.position.x = this.boundaries.minX;
    if (movable.position.x > this.boundaries.maxX) movable.position.x = this.boundaries.maxX;
    if (movable.position.y < this.boundaries.minY) movable.position.y = this.boundaries.minY;
    if (movable.position.y > this.boundaries.maxY) movable.position.y = this.boundaries.maxY; 
  }

  ngOnDestroy() {

  }
}