import { computedFrom } from 'aurelia-framework';
import * as _ from "underscore";
import {ObserverLocator} from 'aurelia-framework';
import {inject} from 'aurelia-framework'; // or from 'aurelia-framework'

let self;
@inject(ObserverLocator)
class AnalyticsModel {
    constructor(observerLocator) {
        this.connections = [];
        this.arrayObserver = observerLocator.getArrayObserver;
        this.arrayObserver(this.connections).subscribe(() => console.log(this.connections));
        // Dispose of observer when you are done via: subscription.dispose();
        self = this;
    }

    groupByUrl() {
        if (self && self.connections()) {
            var lastUrls = [];
            _.each(self.connections(), function (item) {
                if (item.lastNavigateEvent() && item.lastNavigateEvent().url()) {
                    lastUrls.push({
                        conn: item,
                        to: item.lastNavigateEvent().toFormatted()
                    });
                }
            });

            var grouped = _.groupBy(lastUrls, 'to');

            var normalized = [];
            for (var p in grouped) {
                normalized.push({
                    to: p,
                    connections: grouped[p]
                });
            }

            return normalized;
        }

        return [];
    }
    // @computedFrom('groupByUrl')

    groupByUrlAndCode(code) {
        if (self && self.connections()) {
            var lastUrls = [];
            _.each(self.connections(), function (item) {
                if (item.lastNavigateEvent() && item.application().code === code) {
                    lastUrls.push({
                        conn: item,
                        to: item.lastNavigateEvent().toFormatted()
                    });
                }
            });

            var grouped = _.groupBy(lastUrls, 'to');

            var normalized = [];
            for (var p in grouped) {
                normalized.push({
                    to: p,
                    connections: grouped[p]
                });
            }

            return normalized;
        }

        return [];
    }

    merge(conn) {
        //find existing connection
        var existing = _.find(self.connections(), function (connection) {
            return conn.id() === connection.id();
        });

        if (existing) {
            //add missing events
            var mergedEvents = existing.events().concat(conn.events());
            var events = sort.sortEventsByDateAscending(mergedEvents);
            var uniqueEvents = _.uniq(events, function (event) {
                return event.id();
            })
            existing.events(uniqueEvents);
            existing.userName(conn.userName());
            self.connections.valueHasMutated();
        }
        else {
            self.connections.push(conn);
        }
    }

    remove(connectionId) {
        self.connections.remove(function (item) { return item.id() === connectionId; })
    }
}

export let analyticsModel = new AnalyticsModel();